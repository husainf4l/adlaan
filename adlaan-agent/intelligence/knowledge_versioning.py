"""
Knowledge Versioning System for Legal AI
Manages jurisdiction-specific laws with temporal versioning
"""

from typing import Dict, List, Optional, Union
from dataclasses import dataclass, asdict
from datetime import datetime, date
import json
from pathlib import Path
import sqlite3
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document


def safe_date_parse(date_str: Union[str, None], default_date: str = "1900-01-01") -> date:
    """Safely parse date string, handling None and invalid formats"""
    if not date_str or not isinstance(date_str, str):
        return date.fromisoformat(default_date)
    try:
        return date.fromisoformat(date_str)
    except (ValueError, TypeError):
        return date.fromisoformat(default_date)


def safe_datetime_parse(datetime_str: Union[str, None]) -> Optional[datetime]:
    """Safely parse datetime string, handling None and invalid formats"""
    if not datetime_str or not isinstance(datetime_str, str):
        return None
    try:
        return datetime.fromisoformat(datetime_str)
    except (ValueError, TypeError):
        return None


@dataclass
class LegalKnowledgeEntry:
    """Represents a versioned legal knowledge entry"""
    id: str
    jurisdiction: str
    law_type: str  # statute, regulation, case_law, constitutional
    title: str
    content: str
    effective_date: date
    expiry_date: Optional[date]
    version: str
    source: str
    reliability_score: float  # 0.0-1.0
    last_updated: datetime
    tags: List[str]
    cross_references: List[str]
    
    def is_active(self, as_of_date: date = None) -> bool:
        """Check if this law version is active on a given date"""
        check_date = as_of_date or date.today()
        if check_date < self.effective_date:
            return False
        if self.expiry_date and check_date > self.expiry_date:
            return False
        return True


class LegalKnowledgeManager:
    """Manages versioned legal knowledge with temporal queries"""
    
    def __init__(self, knowledge_db_path: str = "legal_knowledge.db"):
        self.db_path = knowledge_db_path
        self.embeddings = OpenAIEmbeddings()
        self.vector_stores = {}  # jurisdiction -> FAISS store
        self._init_database()
        self._load_vector_stores()
    
    def _init_database(self):
        """Initialize SQLite database for structured legal data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS legal_knowledge (
                id TEXT PRIMARY KEY,
                jurisdiction TEXT,
                law_type TEXT,
                title TEXT,
                content TEXT,
                effective_date TEXT,
                expiry_date TEXT,
                version TEXT,
                source TEXT,
                reliability_score REAL,
                last_updated TEXT,
                tags TEXT,
                cross_references TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_jurisdiction_date 
            ON legal_knowledge(jurisdiction, effective_date, expiry_date)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_law_type_version
            ON legal_knowledge(law_type, version)
        ''')
        
        conn.commit()
        conn.close()
    
    def _load_vector_stores(self):
        """Load or create FAISS vector stores for each jurisdiction"""
        # This would load existing vector stores or create new ones
        jurisdictions = self._get_jurisdictions()
        
        for jurisdiction in jurisdictions:
            vector_path = f"vectors/{jurisdiction}"
            try:
                if Path(f"{vector_path}.faiss").exists():
                    self.vector_stores[jurisdiction] = FAISS.load_local(
                        vector_path, self.embeddings
                    )
                else:
                    # Create empty vector store
                    dummy_docs = [Document(page_content="placeholder", metadata={"jurisdiction": jurisdiction})]
                    self.vector_stores[jurisdiction] = FAISS.from_documents(
                        dummy_docs, self.embeddings
                    )
            except Exception as e:
                print(f"Error loading vector store for {jurisdiction}: {e}")
    
    def _get_jurisdictions(self) -> List[str]:
        """Get list of available jurisdictions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT jurisdiction FROM legal_knowledge")
        jurisdictions = [row[0] for row in cursor.fetchall()]
        conn.close()
        return jurisdictions or ["general"]
    
    def add_legal_knowledge(self, entry: LegalKnowledgeEntry):
        """Add a new legal knowledge entry with versioning"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Convert entry to database format
        entry_dict = asdict(entry)
        entry_dict['effective_date'] = entry.effective_date.isoformat()
        entry_dict['expiry_date'] = entry.expiry_date.isoformat() if entry.expiry_date else None
        entry_dict['last_updated'] = entry.last_updated.isoformat()
        entry_dict['tags'] = json.dumps(entry.tags)
        entry_dict['cross_references'] = json.dumps(entry.cross_references)
        
        cursor.execute('''
            INSERT OR REPLACE INTO legal_knowledge 
            (id, jurisdiction, law_type, title, content, effective_date, expiry_date, 
             version, source, reliability_score, last_updated, tags, cross_references)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tuple(entry_dict.values()))
        
        conn.commit()
        conn.close()
        
        # Add to vector store
        self._add_to_vector_store(entry)
    
    def _add_to_vector_store(self, entry: LegalKnowledgeEntry):
        """Add entry to appropriate vector store"""
        if entry.jurisdiction not in self.vector_stores:
            # Create new vector store for this jurisdiction
            dummy_docs = [Document(page_content="placeholder", metadata={"jurisdiction": entry.jurisdiction})]
            self.vector_stores[entry.jurisdiction] = FAISS.from_documents(
                dummy_docs, self.embeddings
            )
        
        # Create document for vector storage
        doc = Document(
            page_content=f"{entry.title}\n\n{entry.content}",
            metadata={
                "id": entry.id,
                "jurisdiction": entry.jurisdiction,
                "law_type": entry.law_type,
                "effective_date": entry.effective_date.isoformat(),
                "version": entry.version,
                "source": entry.source,
                "reliability_score": entry.reliability_score,
                "tags": json.dumps(entry.tags)
            }
        )
        
        # Add to vector store
        self.vector_stores[entry.jurisdiction].add_documents([doc])
        
        # Save updated vector store
        vector_path = f"vectors/{entry.jurisdiction}"
        Path("vectors").mkdir(exist_ok=True)
        self.vector_stores[entry.jurisdiction].save_local(vector_path)
    
    def get_active_laws(self, jurisdiction: str, as_of_date: date = None, 
                       law_type: str = None) -> List[LegalKnowledgeEntry]:
        """Get all active laws for a jurisdiction on a specific date"""
        check_date = as_of_date or date.today()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = '''
            SELECT * FROM legal_knowledge 
            WHERE jurisdiction = ? 
            AND effective_date <= ?
            AND (expiry_date IS NULL OR expiry_date > ?)
        '''
        params = [jurisdiction, check_date.isoformat(), check_date.isoformat()]
        
        if law_type:
            query += " AND law_type = ?"
            params.append(law_type)
        
        query += " ORDER BY effective_date DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_entry(row) for row in rows]
    
    def get_law_versions(self, jurisdiction: str, law_id_base: str) -> List[LegalKnowledgeEntry]:
        """Get all versions of a specific law"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM legal_knowledge 
            WHERE jurisdiction = ? AND id LIKE ?
            ORDER BY effective_date DESC
        ''', (jurisdiction, f"{law_id_base}%"))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_entry(row) for row in rows]
    
    def semantic_search(self, query: str, jurisdiction: str = None, 
                       as_of_date: date = None, k: int = 5) -> List[Dict]:
        """Perform semantic search across legal knowledge"""
        check_date = as_of_date or date.today()
        results = []
        
        # Determine which jurisdictions to search
        search_jurisdictions = [jurisdiction] if jurisdiction else list(self.vector_stores.keys())
        
        for juris in search_jurisdictions:
            if juris not in self.vector_stores:
                continue
                
            # Perform similarity search
            docs = self.vector_stores[juris].similarity_search_with_score(query, k=k)
            
            for doc, score in docs:
                metadata = doc.metadata
                
                # Check if this law was active on the specified date
                effective_date = safe_date_parse(metadata.get("effective_date"))
                if effective_date > check_date:
                    continue
                
                results.append({
                    "content": doc.page_content,
                    "metadata": metadata,
                    "similarity_score": float(score),
                    "jurisdiction": juris
                })
        
        # Sort by similarity score
        return sorted(results, key=lambda x: x["similarity_score"])[:k]
    
    def get_jurisdiction_snapshot(self, jurisdiction: str, as_of_date: date) -> Dict:
        """Get complete legal snapshot for a jurisdiction on a specific date"""
        laws = self.get_active_laws(jurisdiction, as_of_date)
        
        snapshot = {
            "jurisdiction": jurisdiction,
            "snapshot_date": as_of_date.isoformat(),
            "total_laws": len(laws),
            "by_type": {},
            "laws": []
        }
        
        for law in laws:
            law_type = law.law_type
            if law_type not in snapshot["by_type"]:
                snapshot["by_type"][law_type] = 0
            snapshot["by_type"][law_type] += 1
            
            snapshot["laws"].append({
                "id": law.id,
                "title": law.title,
                "type": law.law_type,
                "effective_date": law.effective_date.isoformat(),
                "version": law.version,
                "reliability_score": law.reliability_score
            })
        
        return snapshot
    
    def _row_to_entry(self, row) -> LegalKnowledgeEntry:
        """Convert database row to LegalKnowledgeEntry"""
        return LegalKnowledgeEntry(
            id=row[0],
            jurisdiction=row[1],
            law_type=row[2],
            title=row[3],
            content=row[4],
            effective_date=safe_date_parse(row[5]),
            expiry_date=safe_date_parse(row[6]) if row[6] else None,
            version=row[7],
            source=row[8],
            reliability_score=row[9],
            last_updated=safe_datetime_parse(row[10]) or datetime.now(),
            tags=json.loads(row[11]) if row[11] else [],
            cross_references=json.loads(row[12]) if row[12] else []
        )


class JurisdictionManager:
    """Manages jurisdiction-specific legal knowledge and updates"""
    
    def __init__(self, knowledge_manager: LegalKnowledgeManager):
        self.km = knowledge_manager
        self.supported_jurisdictions = {
            "jordan": "Jordan",
            "united_states": "United States",
            "united_kingdom": "United Kingdom", 
            "european_union": "European Union",
            "uae": "United Arab Emirates",
            "saudi_arabia": "Saudi Arabia",
            "general": "General Legal Principles"
        }
    
    def add_jurisdiction_law(self, jurisdiction: str, law_data: Dict):
        """Add a law specific to a jurisdiction with proper versioning"""
        
        # Generate versioned ID
        base_id = f"{jurisdiction}_{law_data['type']}_{law_data['year']}"
        version = law_data.get('version', '1.0')
        law_id = f"{base_id}_v{version}"
        
        entry = LegalKnowledgeEntry(
            id=law_id,
            jurisdiction=jurisdiction,
            law_type=law_data['type'],
            title=law_data['title'],
            content=law_data['content'],
            effective_date=safe_date_parse(law_data.get('effective_date')),
            expiry_date=safe_date_parse(law_data.get('expiry_date')) if law_data.get('expiry_date') else None,
            version=version,
            source=law_data.get('source', 'Official Government Source'),
            reliability_score=law_data.get('reliability_score', 0.9),
            last_updated=datetime.utcnow(),
            tags=law_data.get('tags', []),
            cross_references=law_data.get('cross_references', [])
        )
        
        self.km.add_legal_knowledge(entry)
        return entry
    
    def update_law_version(self, jurisdiction: str, base_law_id: str, new_version_data: Dict):
        """Create a new version of an existing law"""
        
        # Expire the previous version
        old_versions = self.km.get_law_versions(jurisdiction, base_law_id)
        if old_versions:
            latest = old_versions[0]
            # Set expiry date for the current version
            latest.expiry_date = safe_date_parse(new_version_data.get('effective_date'))
            self.km.add_legal_knowledge(latest)
        
        # Add new version
        return self.add_jurisdiction_law(jurisdiction, new_version_data)
    
    def get_jurisdiction_laws(self, jurisdiction: str, as_of_date: date = None) -> Dict:
        """Get all laws for a jurisdiction with version information"""
        laws = self.km.get_active_laws(jurisdiction, as_of_date)
        
        return {
            "jurisdiction": self.supported_jurisdictions.get(jurisdiction, jurisdiction),
            "as_of_date": (as_of_date or date.today()).isoformat(),
            "law_count": len(laws),
            "laws": [
                {
                    "id": law.id,
                    "title": law.title,
                    "type": law.law_type,
                    "version": law.version,
                    "effective_date": law.effective_date.isoformat(),
                    "reliability": law.reliability_score,
                    "tags": law.tags
                } for law in laws
            ]
        }


# Sample data loader for testing
def load_sample_legal_data(km: LegalKnowledgeManager):
    """Load sample legal data for different jurisdictions"""
    
    # Jordan Commercial Law 2023
    jordan_commercial = LegalKnowledgeEntry(
        id="jordan_commercial_2023_v1.0",
        jurisdiction="jordan",
        law_type="statute",
        title="Jordan Commercial Companies Law No. 22 of 1997 (Amended 2023)",
        content="This law regulates the establishment, management, and dissolution of commercial companies in Jordan...",
        effective_date=date(2023, 1, 1),
        expiry_date=None,
        version="1.0",
        source="Official Gazette of Jordan",
        reliability_score=0.95,
        last_updated=datetime.utcnow(),
        tags=["commercial", "companies", "corporate", "business"],
        cross_references=["jordan_investment_2022_v1.0"]
    )
    
    # UK GDPR 2024 Update
    uk_gdpr = LegalKnowledgeEntry(
        id="uk_gdpr_2024_v2.1",
        jurisdiction="united_kingdom",
        law_type="regulation",
        title="UK General Data Protection Regulation 2024 Update",
        content="Updated data protection regulations following Brexit and technological advances...",
        effective_date=date(2024, 5, 25),
        expiry_date=None,
        version="2.1",
        source="Information Commissioner's Office",
        reliability_score=0.98,
        last_updated=datetime.utcnow(),
        tags=["data_protection", "privacy", "gdpr", "technology"],
        cross_references=["uk_data_act_2024_v1.0"]
    )
    
    # US Employment Law 2024
    us_employment = LegalKnowledgeEntry(
        id="us_federal_employment_2024_v1.2",
        jurisdiction="united_states",
        law_type="statute",
        title="Federal Employment Standards Act 2024 Amendment",
        content="Updated employment standards including remote work provisions and AI usage in workplace...",
        effective_date=date(2024, 7, 1),
        expiry_date=None,
        version="1.2",
        source="US Department of Labor",
        reliability_score=0.92,
        last_updated=datetime.utcnow(),
        tags=["employment", "labor", "remote_work", "ai_workplace"],
        cross_references=["us_nlra_2023_v3.0"]
    )
    
    # Add sample entries
    for entry in [jordan_commercial, uk_gdpr, us_employment]:
        km.add_legal_knowledge(entry)


# Example usage
if __name__ == "__main__":
    # Initialize system
    km = LegalKnowledgeManager()
    jurisdiction_manager = JurisdictionManager(km)
    
    # Load sample data
    load_sample_legal_data(km)
    
    # Test semantic search
    results = km.semantic_search("commercial company registration", jurisdiction="jordan")
    print("Search Results:")
    for result in results:
        print(f"- {result['metadata']['title']} (Score: {result['similarity_score']:.3f})")
    
    # Test jurisdiction snapshot
    snapshot = km.get_jurisdiction_snapshot("jordan", date(2024, 1, 1))
    print(f"\nJordan Legal Snapshot: {snapshot['total_laws']} active laws")
    
    # Test law versions
    versions = km.get_law_versions("uk", "uk_gdpr")
    print(f"\nUK GDPR Versions: {len(versions)} versions found")
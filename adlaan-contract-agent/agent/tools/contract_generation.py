"""
Contract generation tools for creating legal documents.

This module provides tools for gathering client information, determining legal requirements,
and generating contract clauses for different jurisdictions (Jordan, KSA, Dubai).
"""

from typing import Dict, Any, List
from langchain_core.tools import tool


@tool
def identify_contract_type(description: str) -> Dict[str, Any]:
    """
    Identify the type of contract needed based on client description.
    
    Args:
        description: Client's description of what they need
        
    Returns:
        Dict containing contract type and recommended structure
    """
    # Common contract types and their characteristics
    contract_types = {
        "employment": {
            "name": "Employment Contract",
            "required_info": [
                "employer_name", "employee_name", "position", "salary", 
                "start_date", "work_location", "benefits", "termination_clause"
            ],
            "sections": ["parties", "position_duties", "compensation", "term", "termination"]
        },
        "service": {
            "name": "Service Agreement",
            "required_info": [
                "service_provider", "client_name", "service_description", 
                "payment_terms", "delivery_timeline", "scope_of_work"
            ],
            "sections": ["parties", "services", "payment", "timeline", "liability"]
        },
        "sale": {
            "name": "Sale Contract",
            "required_info": [
                "seller_name", "buyer_name", "item_description", "price", 
                "delivery_terms", "warranty", "payment_method"
            ],
            "sections": ["parties", "goods", "price", "delivery", "warranties"]
        },
        "rental": {
            "name": "Rental Agreement",
            "required_info": [
                "landlord_name", "tenant_name", "property_description", 
                "rent_amount", "lease_term", "deposit", "utilities"
            ],
            "sections": ["parties", "property", "rent", "term", "obligations"]
        },
        "partnership": {
            "name": "Partnership Agreement",
            "required_info": [
                "partner_names", "business_purpose", "capital_contributions", 
                "profit_sharing", "management_structure", "dissolution_terms"
            ],
            "sections": ["parties", "purpose", "capital", "management", "dissolution"]
        }
    }
    
    # Simple keyword matching to identify contract type
    description_lower = description.lower()
    
    for contract_type, details in contract_types.items():
        keywords = {
            "employment": ["job", "employee", "work", "salary", "hire", "employment"],
            "service": ["service", "consulting", "freelance", "project", "contractor"],
            "sale": ["buy", "sell", "purchase", "goods", "product", "sale"],
            "rental": ["rent", "lease", "property", "apartment", "house", "tenant"],
            "partnership": ["partner", "business", "joint", "venture", "partnership"]
        }
        
        if any(keyword in description_lower for keyword in keywords.get(contract_type, [])):
            return {
                "contract_type": contract_type,
                "details": details,
                "confidence": "high" if sum(1 for kw in keywords[contract_type] if kw in description_lower) > 1 else "medium"
            }
    
    return {
        "contract_type": "general",
        "details": {
            "name": "General Contract",
            "required_info": ["party1_name", "party2_name", "agreement_terms", "payment", "obligations"],
            "sections": ["parties", "terms", "obligations", "payment", "miscellaneous"]
        },
        "confidence": "low"
    }


@tool
def get_jurisdiction_requirements(jurisdiction: str, contract_type: str) -> Dict[str, Any]:
    """
    Get legal requirements for specific jurisdiction and contract type.
    
    Args:
        jurisdiction: "jordan", "ksa", or "dubai"
        contract_type: Type of contract being generated
        
    Returns:
        Dict containing legal requirements and mandatory clauses
    """
    requirements = {
        "jordan": {
            "general": {
                "language": "Arabic or bilingual (Arabic/English)",
                "mandatory_clauses": [
                    "governing_law", "dispute_resolution", "force_majeure"
                ],
                "legal_requirements": [
                    "Must comply with Jordanian Civil Code",
                    "Contracts over 500 JOD require written form",
                    "Dispute resolution through Jordanian courts"
                ],
                "templates": {
                    "governing_law": "This contract shall be governed by and construed in accordance with the laws of the Hashemite Kingdom of Jordan.",
                    "dispute_resolution": "Any disputes arising from this contract shall be resolved through the competent courts of Jordan."
                }
            },
            "employment": {
                "additional_requirements": [
                    "Must comply with Jordan Labor Law No. 8 of 1996",
                    "Maximum working hours: 8 hours/day, 48 hours/week",
                    "Minimum wage compliance required",
                    "Social security registration mandatory"
                ],
                "mandatory_clauses": [
                    "probation_period", "social_security", "working_hours", "annual_leave"
                ]
            }
        },
        "ksa": {
            "general": {
                "language": "Arabic (English translation acceptable)",
                "mandatory_clauses": [
                    "governing_law", "sharia_compliance", "dispute_resolution"
                ],
                "legal_requirements": [
                    "Must comply with Saudi Arabian law",
                    "Sharia law compatibility required",
                    "Commercial disputes through SCCA"
                ],
                "templates": {
                    "governing_law": "This contract shall be governed by the laws of the Kingdom of Saudi Arabia.",
                    "sharia_compliance": "All terms must be compatible with Islamic Sharia principles."
                }
            },
            "employment": {
                "additional_requirements": [
                    "Must comply with Saudi Labor Law",
                    "Saudization requirements may apply",
                    "Working hours: Max 8 hours/day",
                    "Annual leave: Minimum 21 days"
                ]
            }
        },
        "dubai": {
            "general": {
                "language": "Arabic or English",
                "mandatory_clauses": [
                    "governing_law", "dispute_resolution", "jurisdiction"
                ],
                "legal_requirements": [
                    "Must comply with UAE Federal Law",
                    "DIFC courts for international disputes",
                    "Dubai Courts for local disputes"
                ],
                "templates": {
                    "governing_law": "This contract shall be governed by the laws of the United Arab Emirates.",
                    "dispute_resolution": "Disputes shall be resolved through Dubai Courts or DIFC Courts as applicable."
                }
            },
            "employment": {
                "additional_requirements": [
                    "Must comply with UAE Labor Law No. 8 of 1980",
                    "Working hours: Max 8 hours/day, 48 hours/week",
                    "End of service benefits mandatory",
                    "Visa and work permit requirements"
                ]
            }
        }
    }
    
    jurisdiction_data = requirements.get(jurisdiction, requirements["dubai"])
    general_req = jurisdiction_data.get("general", {})
    specific_req = jurisdiction_data.get(contract_type, {})
    
    return {
        "jurisdiction": jurisdiction,
        "contract_type": contract_type,
        "language": general_req.get("language", "English"),
        "mandatory_clauses": general_req.get("mandatory_clauses", []) + specific_req.get("mandatory_clauses", []),
        "legal_requirements": general_req.get("legal_requirements", []) + specific_req.get("additional_requirements", []),
        "clause_templates": general_req.get("templates", {}),
        "compliance_notes": specific_req.get("compliance_notes", [])
    }


@tool
def generate_information_questions(contract_type: str, jurisdiction: str, existing_info: Dict[str, Any]) -> List[str]:
    """
    Generate questions to gather missing client information.
    
    Args:
        contract_type: Type of contract being generated
        jurisdiction: Legal jurisdiction
        existing_info: Information already collected
        
    Returns:
        List of questions to ask the client
    """
    # Get required information based on contract type
    type_requirements = {
        "employment": [
            "employer_name", "employer_address", "employee_name", "employee_address",
            "position_title", "job_description", "salary_amount", "salary_currency",
            "start_date", "work_location", "working_hours", "benefits", "probation_period"
        ],
        "service": [
            "service_provider_name", "service_provider_address", "client_name", "client_address",
            "service_description", "scope_of_work", "payment_amount", "payment_terms",
            "delivery_timeline", "milestones", "intellectual_property"
        ],
        "sale": [
            "seller_name", "seller_address", "buyer_name", "buyer_address",
            "item_description", "quantity", "price", "payment_method",
            "delivery_date", "delivery_location", "warranty_terms"
        ],
        "rental": [
            "landlord_name", "landlord_address", "tenant_name", "tenant_address",
            "property_address", "property_description", "rent_amount", "lease_duration",
            "security_deposit", "utilities_responsibility", "maintenance_responsibility"
        ]
    }
    
    required_fields = type_requirements.get(contract_type, [
        "party1_name", "party1_address", "party2_name", "party2_address",
        "agreement_description", "payment_terms", "duration"
    ])
    
    # Generate user-friendly questions
    question_templates = {
        "employer_name": "What is the name of the employing company or organization?",
        "employer_address": "What is the employer's complete address?",
        "employee_name": "What is the full name of the employee?",
        "employee_address": "What is the employee's address?",
        "position_title": "What is the job title or position?",
        "job_description": "Please describe the main duties and responsibilities of this position.",
        "salary_amount": "What is the salary amount?",
        "salary_currency": f"What currency should be used? (Note: {jurisdiction.upper()} typically uses {'JOD' if jurisdiction == 'jordan' else 'SAR' if jurisdiction == 'ksa' else 'AED'})",
        "start_date": "What is the intended start date?",
        "work_location": "Where will the work be performed? (office address or remote)",
        "working_hours": "What are the working hours? (e.g., 9 AM to 5 PM, Sunday to Thursday)",
        "benefits": "What benefits are included? (health insurance, vacation days, etc.)",
        "probation_period": "Is there a probation period? If so, how long?",
        
        "service_provider_name": "What is the name of the service provider?",
        "service_provider_address": "What is the service provider's address?",
        "client_name": "What is the client's name or company name?",
        "client_address": "What is the client's address?",
        "service_description": "Please describe the services to be provided.",
        "scope_of_work": "What is the detailed scope of work and deliverables?",
        "payment_amount": "What is the total payment amount or rate?",
        "payment_terms": "What are the payment terms? (e.g., 50% upfront, net 30 days)",
        "delivery_timeline": "What is the expected timeline for completion?",
        
        "seller_name": "What is the seller's full name or company name?",
        "buyer_name": "What is the buyer's full name or company name?",
        "item_description": "Please describe the item(s) being sold in detail.",
        "quantity": "What is the quantity being sold?",
        "price": "What is the total price?",
        "payment_method": "How will payment be made? (cash, bank transfer, installments, etc.)",
        "delivery_date": "When should the item(s) be delivered?",
        "delivery_location": "Where should the item(s) be delivered?",
        "warranty_terms": "Are there any warranty terms or guarantees?",
        
        "landlord_name": "What is the landlord's full name?",
        "tenant_name": "What is the tenant's full name?",
        "property_address": "What is the complete address of the rental property?",
        "property_description": "Please describe the property (type, size, furnished/unfurnished, etc.)",
        "rent_amount": "What is the monthly rent amount?",
        "lease_duration": "What is the lease duration? (e.g., 1 year, 6 months)",
        "security_deposit": "What is the security deposit amount?",
        "utilities_responsibility": "Who is responsible for utilities? (tenant, landlord, or shared)",
        "maintenance_responsibility": "Who is responsible for maintenance and repairs?"
    }
    
    # Find missing information
    missing_fields = [field for field in required_fields if field not in existing_info or not existing_info[field]]
    
    # Generate questions for missing fields
    questions = []
    for field in missing_fields[:5]:  # Limit to 5 questions at a time
        question = question_templates.get(field, f"Please provide information about: {field.replace('_', ' ').title()}")
        questions.append(question)
    
    return questions


@tool
def generate_contract_clause(clause_type: str, client_info: Dict[str, Any], jurisdiction: str) -> str:
    """
    Generate a specific contract clause based on client information.
    
    Args:
        clause_type: Type of clause to generate
        client_info: Client information dictionary
        jurisdiction: Legal jurisdiction
        
    Returns:
        Generated clause text
    """
    templates = {
        "parties": {
            "employment": "This Employment Agreement is entered into between {employer_name}, a company located at {employer_address} (\"Employer\"), and {employee_name}, residing at {employee_address} (\"Employee\").",
            "service": "This Service Agreement is entered into between {service_provider_name}, located at {service_provider_address} (\"Service Provider\"), and {client_name}, located at {client_address} (\"Client\").",
            "sale": "This Sale Agreement is entered into between {seller_name}, located at {seller_address} (\"Seller\"), and {buyer_name}, located at {buyer_address} (\"Buyer\")."
        },
        "compensation": {
            "employment": "The Employee shall receive a salary of {salary_amount} {salary_currency} per {payment_period}, payable {payment_schedule}. This compensation includes {benefits}."
        },
        "term": {
            "employment": "This agreement shall commence on {start_date} and shall continue {contract_duration}. {probation_clause}",
            "service": "This agreement shall commence on {start_date} and shall be completed by {end_date}."
        },
        "governing_law": {
            "jordan": "This Agreement shall be governed by and construed in accordance with the laws of the Hashemite Kingdom of Jordan.",
            "ksa": "This Agreement shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia and principles of Islamic Sharia.",
            "dubai": "This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates."
        }
    }
    
    # Get the appropriate template
    clause_templates = templates.get(clause_type, {})
    
    if jurisdiction in clause_templates:
        template = clause_templates[jurisdiction]
    elif client_info.get("contract_type") in clause_templates:
        template = clause_templates[client_info.get("contract_type", "")]
    else:
        return f"[{clause_type.upper()} CLAUSE - Template not available]"
    
    # Format the template with client information
    try:
        formatted_clause = template.format(**client_info)
        return formatted_clause
    except KeyError as e:
        return f"[{clause_type.upper()} CLAUSE - Missing information: {str(e)}]"


@tool
def validate_contract_completeness(contract_sections: Dict[str, str], jurisdiction: str, contract_type: str) -> Dict[str, Any]:
    """
    Validate that the contract has all required sections and clauses.
    
    Args:
        contract_sections: Dictionary of contract sections
        jurisdiction: Legal jurisdiction
        contract_type: Type of contract
        
    Returns:
        Validation results with missing sections and recommendations
    """
    required_sections = {
        "employment": ["parties", "position_duties", "compensation", "term", "termination", "governing_law"],
        "service": ["parties", "services", "payment", "timeline", "liability", "governing_law"],
        "sale": ["parties", "goods", "price", "delivery", "warranties", "governing_law"],
        "rental": ["parties", "property", "rent", "term", "obligations", "governing_law"],
        "general": ["parties", "terms", "obligations", "payment", "governing_law"]
    }
    
    mandatory_clauses = {
        "jordan": ["governing_law", "dispute_resolution"],
        "ksa": ["governing_law", "sharia_compliance", "dispute_resolution"],
        "dubai": ["governing_law", "dispute_resolution", "jurisdiction"]
    }
    
    required = required_sections.get(contract_type, required_sections["general"])
    mandatory = mandatory_clauses.get(jurisdiction, mandatory_clauses["dubai"])
    
    missing_sections = [section for section in required if section not in contract_sections]
    missing_mandatory = [clause for clause in mandatory if clause not in contract_sections]
    
    completeness_score = (len(required) - len(missing_sections)) / len(required) * 100
    
    return {
        "is_complete": len(missing_sections) == 0 and len(missing_mandatory) == 0,
        "completeness_score": round(completeness_score, 1),
        "missing_sections": missing_sections,
        "missing_mandatory_clauses": missing_mandatory,
        "total_sections": len(contract_sections),
        "required_sections": len(required),
        "recommendations": [
            f"Add {section} section" for section in missing_sections
        ] + [
            f"Include mandatory {clause} clause for {jurisdiction}" for clause in missing_mandatory
        ]
    }

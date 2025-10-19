"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, User, Edit } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function Navigation() {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const handleEdit = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim() && editEmail.trim()) {
      updateUser(editName.trim(), editEmail.trim());
      setIsEditing(false);
      setShowDropdown(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName("");
    setEditEmail("");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo/adlaan-02.png" 
            alt="Adlaan Logo" 
            width={120} 
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
            Features
          </a>
          <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
            Solutions
          </a>
          <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
            Testimonials
          </a>
          
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-all duration-200"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">{user?.name || user?.email}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-card border-2 border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
                  {isEditing ? (
                    <div className="p-4 bg-gradient-to-br from-card to-muted">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Edit Profile</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSave}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-sm rounded-md hover:from-primary/90 hover:to-primary transition-colors shadow-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex-1 px-3 py-2 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                        <p className="text-sm font-medium text-foreground">{user?.name || user?.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                Sign In
              </Link>
              <Link href="/signup" className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
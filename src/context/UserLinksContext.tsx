import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

export interface UserLinkGroup {
  id: string;
  name: string;
  links: UserLink[];
}

interface UserLinksContextType {
  groups: UserLinkGroup[];
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<UserLinkGroup>) => void;
  addLink: (groupId: string, link: Omit<UserLink, 'id'>) => void;
  removeLink: (groupId: string, linkId: string) => void;
  reorderGroups: (newGroups: UserLinkGroup[]) => void;
  reorderLinks: (groupId: string, newLinks: UserLink[]) => void;
}

const UserLinksContext = createContext<UserLinksContextType | undefined>(undefined);

export const UserLinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<UserLinkGroup[]>(() => {
    const saved = localStorage.getItem('sknii-link-groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved link groups', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sknii-link-groups', JSON.stringify(groups));
  }, [groups]);

  const addGroup = (name: string) => {
    setGroups(prev => [...prev, { id: crypto.randomUUID(), name, links: [] }]);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateGroup = (id: string, updates: Partial<UserLinkGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addLink = (groupId: string, link: Omit<UserLink, 'id'>) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: [...g.links, { ...link, id: crypto.randomUUID() }]
        };
      }
      return g;
    }));
  };

  const removeLink = (groupId: string, linkId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          links: g.links.filter(l => l.id !== linkId)
        };
      }
      return g;
    }));
  };

  const reorderGroups = (newGroups: UserLinkGroup[]) => {
    setGroups(newGroups);
  };

  const reorderLinks = (groupId: string, newLinks: UserLink[]) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, links: newLinks } : g));
  };

  return (
    <UserLinksContext.Provider value={{ 
      groups, 
      addGroup, 
      removeGroup, 
      updateGroup, 
      addLink, 
      removeLink, 
      reorderGroups, 
      reorderLinks 
    }}>
      {children}
    </UserLinksContext.Provider>
  );
};

export const useUserLinks = () => {
  const context = useContext(UserLinksContext);
  if (!context) throw new Error('useUserLinks must be used within a UserLinksProvider');
  return context;
};

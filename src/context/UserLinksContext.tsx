import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  color?: string;
}

export interface UserSubGroup {
  id: string;
  name: string;
  links: UserLink[];
  color?: string;
}

export interface UserLinkGroup {
  id: string;
  name: string;
  links: UserLink[];
  subgroups: UserSubGroup[];
  color?: string;
}

export interface UserLinksSettings {
  showFrames: boolean;
  startMaximized: boolean;
}

interface UserLinksContextType {
  groups: UserLinkGroup[];
  settings: UserLinksSettings;
  addGroup: (name: string, color?: string) => void;
  removeGroup: (id: string) => void;
  updateGroup: (id: string, updates: Partial<UserLinkGroup>) => void;
  addSubGroup: (groupId: string, name: string, color?: string) => void;
  removeSubGroup: (groupId: string, subGroupId: string) => void;
  updateSubGroup: (groupId: string, subGroupId: string, updates: Partial<UserSubGroup>) => void;
  addLink: (groupId: string, subGroupId: string | null, link: Omit<UserLink, 'id'>) => void;
  removeLink: (groupId: string, subGroupId: string | null, linkId: string) => void;
  reorderGroups: (newGroups: UserLinkGroup[]) => void;
  reorderLinks: (groupId: string, subGroupId: string | null, newLinks: UserLink[]) => void;
  reorderSubGroups: (groupId: string, newSubGroups: UserSubGroup[]) => void;
  updateSettings: (updates: Partial<UserLinksSettings>) => void;
  importConfig: (config: { groups: UserLinkGroup[], settings: UserLinksSettings }) => void;
  clearConfig: () => void;
}

const UserLinksContext = createContext<UserLinksContextType | undefined>(undefined);

const defaultSettings: UserLinksSettings = {
  showFrames: true,
  startMaximized: false,
};

export const UserLinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<UserLinkGroup[]>(() => {
    const saved = localStorage.getItem('sknii-link-groups-v3');
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

  const [settings, setSettings] = useState<UserLinksSettings>(() => {
    const saved = localStorage.getItem('sknii-link-settings-v3');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('sknii-link-groups-v3', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('sknii-link-settings-v3', JSON.stringify(settings));
  }, [settings]);

  const addGroup = (name: string, color?: string) => {
    setGroups(prev => [...prev, { id: crypto.randomUUID(), name, links: [], subgroups: [], color }]);
  };

  const removeGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateGroup = (id: string, updates: Partial<UserLinkGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addSubGroup = (groupId: string, name: string, color?: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subgroups: [...(g.subgroups || []), { id: crypto.randomUUID(), name, links: [], color }]
        };
      }
      return g;
    }));
  };

  const removeSubGroup = (groupId: string, subGroupId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subgroups: (g.subgroups || []).filter(sg => sg.id !== subGroupId)
        };
      }
      return g;
    }));
  };

  const updateSubGroup = (groupId: string, subGroupId: string, updates: Partial<UserSubGroup>) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          subgroups: (g.subgroups || []).map(sg => sg.id === subGroupId ? { ...sg, ...updates } : sg)
        };
      }
      return g;
    }));
  };

  const addLink = (groupId: string, subGroupId: string | null, link: Omit<UserLink, 'id'>) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (subGroupId === null) {
          return { ...g, links: [...g.links, { ...link, id: crypto.randomUUID() }] };
        } else {
          return {
            ...g,
            subgroups: (g.subgroups || []).map(sg => 
              sg.id === subGroupId ? { ...sg, links: [...sg.links, { ...link, id: crypto.randomUUID() }] } : sg
            )
          };
        }
      }
      return g;
    }));
  };

  const removeLink = (groupId: string, subGroupId: string | null, linkId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (subGroupId === null) {
          return { ...g, links: g.links.filter(l => l.id !== linkId) };
        } else {
          return {
            ...g,
            subgroups: (g.subgroups || []).map(sg => 
              sg.id === subGroupId ? { ...sg, links: sg.links.filter(l => l.id !== linkId) } : sg
            )
          };
        }
      }
      return g;
    }));
  };

  const reorderGroups = (newGroups: UserLinkGroup[]) => {
    setGroups(newGroups);
  };

  const reorderLinks = (groupId: string, subGroupId: string | null, newLinks: UserLink[]) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (subGroupId === null) {
          return { ...g, links: newLinks };
        } else {
          return {
            ...g,
            subgroups: (g.subgroups || []).map(sg => sg.id === subGroupId ? { ...sg, links: newLinks } : sg)
          };
        }
      }
      return g;
    }));
  };

  const reorderSubGroups = (groupId: string, newSubGroups: UserSubGroup[]) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, subgroups: newSubGroups } : g));
  };

  const updateSettings = (updates: Partial<UserLinksSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const importConfig = (config: { groups: UserLinkGroup[], settings: UserLinksSettings }) => {
    if (config.groups) setGroups(config.groups);
    if (config.settings) setSettings(config.settings);
  };

  const clearConfig = () => {
    setGroups([]);
    setSettings(defaultSettings);
  };

  return (
    <UserLinksContext.Provider value={{ 
      groups, 
      settings,
      addGroup, 
      removeGroup, 
      updateGroup, 
      addSubGroup,
      removeSubGroup,
      updateSubGroup,
      addLink, 
      removeLink, 
      reorderGroups, 
      reorderLinks,
      reorderSubGroups,
      updateSettings,
      importConfig,
      clearConfig
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

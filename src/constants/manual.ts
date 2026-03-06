export interface ManualEntry {
  id: string;
  title: string;
  content: string;
}

export const MANUAL_ENTRIES: Record<string, ManualEntry> = {
  'get-started': {
    id: 'get-started',
    title: 'Get Started',
    content: `Welcome to SkniiOS.

This system is designed to be both a personalized landing page, and a digital playground where various technologies are tested. 

SHORTCUTS:
You can manage your links via the "Shortcuts" configuration. Add groups to create columns, and subgroups to further organize your bookmarks.

CUSTOMIZATION:
Use the Theme Settings to change the system colors and CRT effects.

BACKUP:
Don't forget to export your configuration in the Backup tab to save your layout permanently!`,
  },
  'about': {
    id: 'about',
    title: 'About SkniiOS',
    content: `SkniiOS v1.0.0

A retro-futuristic terminal-inspired desktop environment. 

Developed by Sknii.
Built with React, Tailwind, and Framer Motion.

Designed for those who miss the clicks, hums, and scanlines of the old world while navigating the new one.`,
  },
};

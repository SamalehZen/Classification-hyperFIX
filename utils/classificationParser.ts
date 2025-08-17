
import type { ClassificationNode } from '../types';

const getTabCount = (line: string): number => {
    const match = line.match(/^\t+/);
    return match ? match[0].length : 0;
};

export const parseHierarchy = (hierarchyString: string): ClassificationNode[] => {
    const lines = hierarchyString.split('\n').filter(line => line.trim() !== '');
    const nodes: ClassificationNode[] = [];
    const parentCodeStack: (string | null)[] = [null, null, null, null, null]; // Supports up to 5 levels deep (root + 4)

    for (const line of lines) {
        const tabCount = getTabCount(line);

        const content = line.trim();
        const parts = content.split(/\s+/);
        const code = parts[0];
        const name = parts.slice(1).join(' ');

        if (!code || !name) continue;

        // Corrected logical level mapping:
        // 1 tab -> level 1 (Secteur)
        // 2 tabs -> level 2 (Rayon)
        // 3 tabs -> level 3 (Famille)
        // 4 tabs -> level 4 (Sous-famille)
        const logicalLevel = tabCount;
        
        // We only care about levels 1-4. Level 0 (the root) is skipped.
        if (logicalLevel < 1 || logicalLevel > 4) continue;

        // Parent is at the stack index of the level above the current one.
        const parentCode = parentCodeStack[logicalLevel - 1];
        
        nodes.push({
            level: logicalLevel,
            code,
            name,
            parentCode,
        });

        // Store the current code at the current level's index for future children.
        parentCodeStack[logicalLevel] = code;
    }

    return nodes;
};

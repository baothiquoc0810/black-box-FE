export const getTagName = (tag) => {
    if (!tag) return '';
    if (typeof tag === 'string') return tag;
    if (typeof tag === 'object' && tag !== null && tag.name) return tag.name;
    return '';
};
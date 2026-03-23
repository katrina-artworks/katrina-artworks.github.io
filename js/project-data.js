(() => {
    const VALID_BLOCK_TYPES = new Set(['paragraph', 'list', 'pillList', 'media', 'video']);
    const VALID_LIST_STYLES = new Set(['unordered', 'ordered']);
    const VALID_MEDIA_DISPLAYS = new Set(['single', 'carousel']);

    function createProjectDataError(message) {
        const error = new Error(message);
        error.name = 'ProjectDataError';
        return error;
    }

    function isObject(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function parseRequiredString(value, label) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw createProjectDataError(`${label} must be a non-empty string`);
        }

        return value;
    }

    function parseOptionalString(value, fallback = '') {
        return typeof value === 'string' ? value : fallback;
    }

    function parseTextArray(value, label) {
        if (value === undefined) {
            return [];
        }

        if (!Array.isArray(value)) {
            throw createProjectDataError(`${label} must be an array`);
        }

        return value.map((item, index) => {
            if (typeof item !== 'string' && typeof item !== 'number') {
                throw createProjectDataError(`${label}[${index}] must be text`);
            }

            return String(item);
        });
    }

    function parseMediaItem(item, label) {
        if (!isObject(item)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        return {
            src: parseRequiredString(item.src, `${label}.src`),
            alt: parseOptionalString(item.alt),
            caption: parseOptionalString(item.caption)
        };
    }

    function parseMedia(media, label) {
        if (!isObject(media)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        const display = media.display === undefined ? 'single' : media.display;
        if (!VALID_MEDIA_DISPLAYS.has(display)) {
            throw createProjectDataError(`${label}.display must be "single" or "carousel"`);
        }

        if (!Array.isArray(media.items) || media.items.length === 0) {
            throw createProjectDataError(`${label}.items must be a non-empty array`);
        }

        return {
            type: 'media',
            display,
            items: media.items.map((item, index) => parseMediaItem(item, `${label}.items[${index}]`))
        };
    }

    function parseVideo(block, label) {
        return {
            type: 'video',
            url: parseRequiredString(block.url, `${label}.url`),
            title: parseOptionalString(block.title)
        };
    }

    function parseProjectBlock(block, label) {
        if (!isObject(block)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        if (!VALID_BLOCK_TYPES.has(block.type)) {
            throw createProjectDataError(`${label}.type is not supported`);
        }

        if (block.type === 'paragraph') {
            return {
                type: 'paragraph',
                text: parseOptionalString(block.text)
            };
        }

        if (block.type === 'list') {
            const style = block.style === undefined ? 'unordered' : block.style;
            if (!VALID_LIST_STYLES.has(style)) {
                throw createProjectDataError(`${label}.style must be "unordered" or "ordered"`);
            }

            return {
                type: 'list',
                style,
                items: parseTextArray(block.items, `${label}.items`)
            };
        }

        if (block.type === 'pillList') {
            return {
                type: 'pillList',
                items: parseTextArray(block.items, `${label}.items`)
            };
        }

        if (block.type === 'video') {
            return parseVideo(block, label);
        }

        return parseMedia(block, label);
    }

    function parseVisibility(visibility, label) {
        if (visibility === undefined) {
            return {};
        }

        if (!isObject(visibility)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        const parsedVisibility = {};

        if (visibility.desktop !== undefined) {
            if (typeof visibility.desktop !== 'boolean') {
                throw createProjectDataError(`${label}.desktop must be a boolean`);
            }

            parsedVisibility.desktop = visibility.desktop;
        }

        if (visibility.mobile !== undefined) {
            if (typeof visibility.mobile !== 'boolean') {
                throw createProjectDataError(`${label}.mobile must be a boolean`);
            }

            parsedVisibility.mobile = visibility.mobile;
        }

        return parsedVisibility;
    }

    function parseProjectSection(section, label) {
        if (!isObject(section)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        if (!Array.isArray(section.blocks)) {
            throw createProjectDataError(`${label}.blocks must be an array`);
        }

        return {
            id: parseOptionalString(section.id),
            title: parseOptionalString(section.title),
            visibility: parseVisibility(section.visibility, `${label}.visibility`),
            blocks: section.blocks.map((block, index) => parseProjectBlock(block, `${label}.blocks[${index}]`))
        };
    }

    function parseProjectMeta(meta, label) {
        if (meta === undefined) {
            return { tags: [] };
        }

        if (!isObject(meta)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        return {
            tags: parseTextArray(meta.tags, `${label}.tags`)
        };
    }

    function parseProject(project, label = 'project') {
        if (!isObject(project)) {
            throw createProjectDataError(`${label} must be an object`);
        }

        return {
            slug: parseRequiredString(project.slug, `${label}.slug`),
            title: parseRequiredString(project.title, `${label}.title`),
            subtitle: parseOptionalString(project.subtitle),
            meta: parseProjectMeta(project.meta, `${label}.meta`),
            hero: {
                media: project.hero?.media ? parseMedia(project.hero.media, `${label}.hero.media`) : null
            },
            sections: Array.isArray(project.sections)
                ? project.sections.map((section, index) => parseProjectSection(section, `${label}.sections[${index}]`))
                : []
        };
    }

    function parseProjectsData(data) {
        if (!isObject(data)) {
            throw createProjectDataError('Project data root must be an object');
        }

        if (!Array.isArray(data.projects)) {
            throw createProjectDataError('Project data root must include a projects array');
        }

        const seenSlugs = new Set();
        const projects = data.projects.map((project, index) => {
            const parsedProject = parseProject(project, `projects[${index}]`);

            if (seenSlugs.has(parsedProject.slug)) {
                throw createProjectDataError(`Duplicate project slug: ${parsedProject.slug}`);
            }

            seenSlugs.add(parsedProject.slug);
            return parsedProject;
        });

        return { projects };
    }

    window.ProjectDataParser = {
        parseProject,
        parseProjectsData
    };
})();

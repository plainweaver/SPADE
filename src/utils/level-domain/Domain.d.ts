declare class Domain {
    /**
     * To turn code string to domain.
     * @param name - Domain name that represents entities to be contained.
     * @param code - Code string that exports a function which discriminates entities.
     */
    constructor(name: string, code: string);

    /**
     * Useful for development. It turns callable js function to domain.*
     * @param name - Domain name that represents entities to be contained.
     * @param func - Callable function which discriminates entities.
     */
    constructor(name: string, func: Function);
}
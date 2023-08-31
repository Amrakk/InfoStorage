interface IUnit {
    name: string;
    code: string;
}

interface IProvincesApiRes<T = undefined> extends IUnit {
    T?: T[];
}

export { IUnit, IProvincesApiRes };

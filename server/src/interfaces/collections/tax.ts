interface ITax {
    name: string;
    taxCode: string;
    address: string;
    representative: string;
    phone: string;
    email: string | null;
    participants: string[];
}

export default ITax;

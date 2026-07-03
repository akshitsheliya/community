import { useEffect, useState } from "react";
import { getBusinessCategories } from "../../Api/Business";

interface Category {
    id: number;
    name: string;
    value: string;
}

const BusinessCategorySelect = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedValue, setSelectedValue] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getBusinessCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e:any) => {
        const selected = e.target.value;
        setSelectedValue(selected);
        console.log("Selected category value:", selected);
    };

    return (
        <div>
            <label htmlFor="category-select">Select Business Category:</label>
            <select id="category-select" value={selectedValue} onChange={handleChange}>
                <option value="">-- Select --</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.value}>
                        {cat.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default BusinessCategorySelect;

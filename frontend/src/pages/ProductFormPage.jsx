import { useParams } from "react-router-dom";

export default function ProductFormPage() {
    const { id } = useParams();

    const editMode = Boolean(id);

    return (
        <div>
            <h1>
                {editMode
                    ? "Edit Product"
                    : "New Product"}
            </h1>

            <form
                style={{
                    maxWidth: "600px"
                }}
            >
                <div>
                    <label>Product Code</label>
                    <input type="text" />
                </div>

                <br />

                <div>
                    <label>Product Name</label>
                    <input type="text" />
                </div>

                <br />

                <div>
                    <label>Description</label>
                    <textarea rows="4"></textarea>
                </div>

                <br />

                <div>
                    <label>Price</label>
                    <input type="number" />
                </div>

                <br />

                <div>
                    <label>Minimum Stock Level</label>
                    <input type="number" />
                </div>

                <br />

                <button type="button">
                    Save Product
                </button>
            </form>
        </div>
    );
}
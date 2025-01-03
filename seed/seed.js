const { Client } = require("pg");

const client = new Client({
    user: "metabase",
    host: "postgres",
    database: "metabaseappdb",
    password: "mysecretpassword",
    port: 5432,
});

const createTables = async () => {
    const queries = `
    CREATE TABLE IF NOT EXISTS regions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      product_id INT REFERENCES products(id),
      region_id INT REFERENCES regions(id),
      date DATE NOT NULL,
      revenue DECIMAL(10, 2) NOT NULL
    );
  `;
    await client.query(queries);
};

const seedData = async () => {
    // Insert Regions
    const regions = ["North", "South", "East", "West"];
    for (const region of regions) {
        await client.query("INSERT INTO regions (name) VALUES ($1) ON CONFLICT DO NOTHING", [region]);
    }

    // Insert Products
    const products = [
        { name: "Laptop", price: 1000 },
        { name: "Smartphone", price: 800 },
        { name: "Tablet", price: 600 },
        { name: "Headphones", price: 200 },
    ];
    for (const product of products) {
        await client.query(
            "INSERT INTO products (name, price) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [product.name, product.price]
        );
    }

    // Insert Sales with Trends
    const salesCount = 100; // Number of random sales to insert
    for (let i = 0; i < salesCount; i++) {
        const productId = Math.floor(Math.random() * products.length) + 1;
        const regionId = Math.floor(Math.random() * regions.length) + 1;

        // Random date within the past year
        const randomDate = new Date(
            Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000
        );
        const month = randomDate.getMonth() + 1; // Get month (1-12)

        // Introduce trends
        let baseRevenue = Math.random() * 200 + 100; // Base revenue between $100 and $300
        if (products[productId - 1].name === "Laptop" && (regions[regionId - 1] === "North" || regions[regionId - 1] === "West")) {
            baseRevenue *= 1.5; // Higher revenue for laptops in North and West
        }
        if (month === 11 || month === 12) {
            baseRevenue *= 1.3; // Increase revenue during holiday months
        }

        await client.query(
            "INSERT INTO sales (product_id, region_id, date, revenue) VALUES ($1, $2, $3, $4)",
            [productId, regionId, randomDate.toISOString().split("T")[0], baseRevenue.toFixed(2)]
        );
    }
};
const main = async () => {
    try {
        await client.connect();
        console.log("Connected to the database.");
        await createTables();
        console.log("Tables created.");
        await seedData();
        console.log("Test data seeded.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
        console.log("Database connection closed.");
    }
};

main();

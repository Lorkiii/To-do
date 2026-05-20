
import Link from "next/link";
import ProductCard from "./components/products/productCard";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
      <Link href="/users">View Users</Link>
      <ProductCard />
    </main>
  );
}

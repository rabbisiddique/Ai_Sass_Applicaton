import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getAllImages } from "@/lib/actions/image.actions";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
// Define the SearchParams interface for the resolved searchParams object
interface SearchParams {
  page?: string;
  query?: string;
}

// Use NextPage type to define the page component with correct props
const Home: NextPage<{ searchParams: Promise<SearchParams> }> = async ({
  searchParams,
}) => {
  // Await the searchParams to resolve the Promise
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1); // Default to 1 if not present
  const searchQuery = (resolvedParams?.query as string) || "";

  const images = await getAllImages({ page, searchQuery });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with Imaginify
        </h1>
        <ul className="flex-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="p-14-medium text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPage}
          page={page}
        />
      </section>
    </>
  );
};

export default Home;

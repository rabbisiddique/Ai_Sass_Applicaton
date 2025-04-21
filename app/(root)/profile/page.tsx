import { type NextPage } from "next"; // Import NextPage for proper typing
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";

// Define the SearchParams interface for the resolved searchParams
interface SearchParams {
  page?: string;
  query?: string;
}

// Use NextPage to type the page component correctly
const Profile: NextPage<{ searchParams: Promise<SearchParams> }> = async ({
  searchParams,
}) => {
  const resolvedParams = await searchParams; // Resolve the Promise
  const page = Number(resolvedParams?.page ?? 1); // Default to 1 if not present
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user._id });

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;

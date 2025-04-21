import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

// Define the transformation type structure

// Define the valid transformation keys
type TransformationTypeKey = keyof typeof transformationTypes;

// Define the SearchParamProps type
interface SearchParamProps {
  params: Promise<{ type: TransformationTypeKey }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  // Await the params to access type
  const { type } = await params;

  // Check if the transformation type is valid
  const transformation = transformationTypes[type];
  if (!transformation) {
    notFound(); // Renders a 404 page for invalid types
  }

  // Check if the user is authenticated
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />
      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={type} // `type` is already TransformationTypeKey
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;

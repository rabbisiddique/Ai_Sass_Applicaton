import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { type NextPage } from "next"; // Import NextPage for proper typing
import { redirect } from "next/navigation";

// Define the TransformationTypeKey type (assuming it's defined in constants)
type TransformationTypeKey = keyof typeof transformationTypes; // e.g., 'restore' | 'removeBackground'

// Define the Params interface for the resolved params
interface Params {
  type: TransformationTypeKey;
}

// Use NextPage to type the page component correctly
const AddTransformationTypePage: NextPage<{
  params: Promise<Params>;
}> = async ({ params }) => {
  const { type } = await params; // Resolve the Promise
  const { userId } = await auth();

  // Now `type` is guaranteed to be a valid key from `TransformationTypeKey`
  const transformation = transformationTypes[type];

  // If no user is authenticated, redirect to the sign-in page
  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;

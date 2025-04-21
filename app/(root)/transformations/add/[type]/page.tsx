import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { TransformationTypeKey } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Define the correct types for the page props
type PageProps = {
  params: { type: TransformationTypeKey }; // type should be a specific key like 'restore' | 'removeBackground' etc.
};

const AddTransformationTypePage = async ({ params: { type } }: PageProps) => {
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

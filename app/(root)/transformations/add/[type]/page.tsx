import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

interface SearchParamProps {
  params: Promise<{ type: TransformationTypeKey }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {
  const { type } = await params;
  const transformation = transformationTypes[type];

  if (!transformation) {
    notFound();
  }

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
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;

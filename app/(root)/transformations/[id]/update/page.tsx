import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getImageByIdI } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { NextPage } from "next";
interface Params {
  id: string;
}
const Page: NextPage<{ params: Promise<Params> }> = async ({ params }) => {
  const { userId } = await auth();
  const { id } = await params; // Resolve the Promise

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const image = await getImageByIdI(id);

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;

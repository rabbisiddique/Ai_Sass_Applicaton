import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getImageByIdI } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.action";
import { PageParams, SearchParams, TransformationTypeKey } from "@/types";
import { auth } from "@clerk/nextjs/server";
type PageProps = {
  searchParams?: SearchParams;
  params: PageParams;
};
const Page = async ({ params: { id } }: PageProps) => {
  const { userId } = await auth();

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

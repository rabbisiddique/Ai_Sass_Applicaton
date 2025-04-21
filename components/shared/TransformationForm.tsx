"use client";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "../ui/input";

import { addImage, updateImage } from "@/lib/actions/image.actions";
import { AspectRatioKey } from "@/lib/utils";
import { getCldImageUrl } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { CustomField } from "./CustomField";
import { InsufficientCreditsModal } from "./InsufficentCreditsModal";
import MediaUploader from "./MediaUploader";
import TransformedImageForm from "./TransformedImageForm";
export const formSchema = z.object({
  // username: z.string().min(2).max(20),
  title: z.string(),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string(),
});
interface IImage {
  _id?: string;
  title: string; // Required
  publicId: string; // Required
  transformationType?: string;
  width?: number;
  height?: number;
  config?: Transformations;
  secureURL?: string;
  transformationURL?: string;
  aspectRatio?: string;
  prompt?: string;
  color?: string;
}

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const [image, setImage] = useState<IImage | null>(data);
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);
  const transformationType = transformationTypes[type];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);

  const router = useRouter();
  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (data || image) {
      const transformationUrl = getCldImageUrl({
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig,
      });

      const imageData = {
        title: values.title,
        publicId: values.publicId,
        transformationType: type as string, // Type assertion if transformationType expects string
        width: image?.width ?? 0,
        height: image?.height ?? 0,
        config: JSON.stringify(transformationConfig ?? {}), // Ensure string
        secureURL: image?.secureURL ?? "",
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };

      if (action === "Add") {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: "/",
          });

          if (newImage) {
            form.reset();
            setImage(null);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }

      if (action === "Update") {
        if (!data?._id) {
          console.error("Cannot update image: _id is missing");
          setIsSubmitting(false);
          return;
        }

        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id,
            },
            userId,
            path: `/transformations/${data._id}`,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    setIsSubmitting(false);
  }
  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];
    setImage((prevState: IImage | null) => {
      if (!prevState) {
        // Handle null case by providing defaults for required fields
        return {
          title: "", // Default value
          publicId: "", // Default value
          aspectRatio: imageSize.aspectRatio,
          width: imageSize.width,
          height: imageSize.height,
        };
      }
      // Update existing IImage
      return {
        ...prevState,
        aspectRatio: imageSize.aspectRatio,
        width: imageSize.width,
        height: imageSize.height,
      };
    });
    setNewTransformation(transformationType.config);
    return onChangeField(value);
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
          <CustomField
            control={form.control}
            name="title"
            formLabel="Image Title"
            className="w-full"
            render={({ field }) => <Input {...field} className="input-field" />}
          />
          {type === "fill" && (
            <CustomField
              control={form.control}
              name="aspectRatio"
              formLabel="Aspect Ratio"
              className="w-full"
              render={({ field }) => (
                <Select
                  onValueChange={(value) =>
                    onSelectFieldHandler(value, field.onChange)
                  }
                  value={field.value}
                >
                  <SelectTrigger className="select-field">
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(aspectRatioOptions).map((key) => (
                      <SelectItem key={key} value={key} className="select-item">
                        {aspectRatioOptions[key as AspectRatioKey].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {(type === "remove" || type === "recolor") && (
            <div className="prompt-field">
              <CustomField
                control={form.control}
                name="prompt"
                formLabel={
                  type === "remove" ? "Object to remove" : "Object to recolor"
                }
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        "prompt",
                        e.target.value,
                        type,
                        field.onChange
                      )
                    }
                  />
                )}
              />
              {type === "recolor" && (
                <CustomField
                  control={form.control}
                  name="color"
                  formLabel="Replacement"
                  className="w-full"
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      className="input-field"
                      onChange={(e) =>
                        onInputChangeHandler(
                          "color",
                          e.target.value,
                          "recolor",
                          field.onChange
                        )
                      }
                    />
                  )}
                />
              )}
            </div>
          )}

          <div className="media-uploader-field">
            <CustomField
              control={form.control}
              name="publicId"
              className="flex size-full flex-col"
              render={({ field }) => (
                <MediaUploader
                  onValueChange={field.onChange}
                  setImage={setImage}
                  publicId={field.value!}
                  image={image}
                  type={type}
                />
              )}
            />
            <TransformedImageForm
              image={image}
              type={type}
              title={form.getValues().title}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              transformationConfig={transformationConfig}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              className="submit-button capitalize "
              disabled={
                isTransforming || isSubmitting || newTransformation === null
              }
              onClick={onTransformHandler}
            >
              {isTransforming ? "Transforming..." : "Apply Transformation"}
            </Button>
            <Button
              type="submit"
              className="submit-button capitalize "
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save Image"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TransformationForm;

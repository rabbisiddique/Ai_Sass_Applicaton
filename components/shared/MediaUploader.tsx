// MediaUploader.tsx
import { useToast } from "@/hooks/use-toast";
import { IImage } from "@/lib/database/models/image.model"; // Adjust the import path
import { dataUrl, getImageSize } from "@/lib/utils";
import {
  CldImage,
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<React.SetStateAction<IImage | null>>;
  publicId: string;
  image: IImage | null;
  type: string;
  author: { _id: string; firstName: string; lastName: string };
};

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  publicId,
  type,
}: MediaUploaderProps) => {
  const { toast } = useToast();

  const onUploadSuccessHandler = (result: CloudinaryUploadWidgetResults) => {
    const info = result.info as {
      public_id?: string;
      width?: number;
      height?: number;
      secure_url?: string;
    };

    const newImage: IImage = {
      publicId: info.public_id ?? "",
      width: info.width ?? 0,
      height: info.height ?? 0,
      secureURL: info.secure_url ?? "",
      title: image?.title ?? "Untitled",
      transformationType: image?.transformationType ?? type,
    };

    setImage(newImage);

    if (info?.public_id) {
      onValueChange(info.public_id);
    }

    toast({
      title: "Image upload successfully",
      description: "1 credit was deducted from your account",
      duration: 5000,
      className: "success-toast",
    });
  };

  const onUploadErrorHandler = () => {
    toast({
      title: "Something went wrong while uploading",
      description: "Please try again",
      duration: 5000,
      className: "error-toast",
    });
  };

  return (
    <CldUploadWidget
      uploadPreset="ai_image"
      options={{ multiple: false, resourceType: "image" }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">Original</h3>
          {publicId ? (
            <div className="cursor-pointer overflow-hidden rounded-[10px]">
              <CldImage
                width={getImageSize(type, image ?? {}, "width")}
                height={getImageSize(type, image ?? {}, "height")}
                src={publicId}
                alt="image"
                sizes={"(max-width:767px) 100vw, 50vw"}
                placeholder={dataUrl as PlaceholderValue}
                className="media-uploader_cldImage"
              />
            </div>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                <Image
                  src="/assets/icons/add.svg"
                  alt="add image"
                  width={24}
                  height={24}
                />
              </div>
              <p className="14-medium">Click here to upload image</p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;

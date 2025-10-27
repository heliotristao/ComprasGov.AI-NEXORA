declare module "*.svg" {
  const content: import("next/dist/shared/lib/image-external").StaticImageData
  export default content
}

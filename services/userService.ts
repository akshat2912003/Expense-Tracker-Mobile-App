import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileCloudinary } from "./imageService";


export const updateUser = async (
  uid: string,
  updateData: UserDataType
) : Promise<ResponseType> => {
  try {

    //image upload 
    if(updateData.image && updateData?.image?.uri){
      const imageUploadRes = await uploadFileCloudinary(updateData.image, 'users');
      if(!imageUploadRes.success){
        return {success: false, msg: imageUploadRes.msg || 'failed to upload image'}
      }
      updateData.image = imageUploadRes.data;
    }

    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, updateData)

    //fetch the user & update the user state
    return {success: true, msg: 'updated successfully'};
  } catch (error:any) {
    console.log('error updating user: ', error);
    return {success: false, msg:error?.message}
  }
}
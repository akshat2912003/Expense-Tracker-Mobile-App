import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { uploadFileCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";

const removeUndefinedFields = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

export const createOrUpdateTransaction = async(
  transactionData: Partial<TransactionType>
): Promise<ResponseType>  => {
  try {
    const {id, type, walletId, amount, image} = transactionData;
    if(!amount || amount<=0 || !walletId || !type){
      return {success: false, msg: "Invalid transaction data!"}
    }

    if(id){
      // updating existing transaction
      const oldTransactionSnapshot = await getDoc(doc(firestore, 'transactions', id));
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOrignal = oldTransaction.type != type || oldTransaction.amount!=amount || oldTransaction.walletId != walletId
      if(shouldRevertOrignal){
        let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
        if(!res.success) return res;
      }
    }else{
      //update wallet for new transaction
      // update wallet
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if(!res.success) return res;
      transactionData.date = new Date();
    }

    //image upload 
    if(image){
          const imageUploadRes = await uploadFileCloudinary(
            image, 
            "transactions"
          );
          if(!imageUploadRes.success){
            return {success: false, msg: imageUploadRes.msg || 'failed to upload receipt'}
          }
          transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id? doc(firestore, 'transactions', id) : doc(collection(firestore, 'transactions'))

    // Remove undefined fields before writing to Firestore
const cleanedTransactionData = removeUndefinedFields(transactionData);
await setDoc(transactionRef, cleanedTransactionData, { merge: true });

    return {
      success: true,
      data: {...transactionData, id: transactionRef.id}
    }
  } catch (err:any) {
    console.log('error creating or updating transaction: ', err);
    return {success: false, msg: err.message}
  }
}


const updateWalletForNewTransaction = async(
  walletId: string,
  amount: number,
  type: string,
) => {
  try{
    const walletRef = doc(firestore, 'wallets', walletId);
    const walletSnapshot = await getDoc(walletRef);
    if(!walletSnapshot.exists()){
      console.log('error updating wallet for new transaction: ');
      return {success: false, msg: 'Wallet not found'}
    }  

    const walletData = walletSnapshot.data() as WalletType;

    if(type == 'expense' && walletData.amount! - amount < 0){
      return {success: false, msg: "Selected wallet don't have enough balance"}
    }

    const updatedType = type == 'income'?'totalIncome' : "totalExpenses";
    const updatedWalletAmount = 
      type == 'income'
        ?Number(walletData.amount) + amount 
        : Number(walletData.amount) - amount;
    
    const updatedTotals = 
      type == 'income'
        ?Number(walletData.totalIncome) + amount 
        : Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
          amount : updatedWalletAmount,
          [updatedType] : updatedTotals
        })
    
    return {success: true}
  } catch (err:any) {
    console.log('error updating wallet for new transaction: ', err);
    return {success: false, msg: err.message}
  }
}



const revertAndUpdateWallets = async(
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string,
) => {
  try{
const originalWalletRef = doc(firestore, 'wallets', oldTransaction.walletId);
const originalWalletSnapshot = await getDoc(originalWalletRef);

if (!originalWalletSnapshot.exists()) {
  return { success: false, msg: "Original wallet not found" };
}

const originalWallet = originalWalletSnapshot.data() as WalletType;


    let newWalletSnapshot = await getDoc(
      doc(firestore, 'wallets', newWalletId)
    );

    let newWallet = newWalletSnapshot.data() as WalletType;

    const revertType = oldTransaction.type == 'income' ? 'totalIncome':'totalExpenses';

    const revertIncomeExpense: number = oldTransaction.type == 'income'?-Number(oldTransaction.amount) : Number(oldTransaction.amount);

    const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense;

    const revertIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount)

    if(newTransactionType =='expense'){
      if(oldTransaction.walletId == newWalletId && revertedWalletAmount<newTransactionAmount){
        return {success: false, msg: "The selected wallet don't have enough balance"}
      }

      if(newWallet.amount! < newTransactionAmount){
        return {success: false, msg: "The selected wallet don't have enough balance"}
      }
      }

        await createOrUpdateWallet({
          id: oldTransaction.walletId,
          amount: revertedWalletAmount,
          [revertType] : revertIncomeExpenseAmount,
        });

        newWalletSnapshot = await getDoc(
        doc(firestore, 'wallets', newWalletId)
        );

        newWallet = newWalletSnapshot.data() as       WalletType;

        const UpdateType = newTransactionType == 'income' ? 'totalIncome':'totalExpenses';

        const updatedTransactionAmount: number = newTransactionType == 'income' ? Number(newTransactionAmount): -Number(newTransactionAmount)

        const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

        const newIncomeExpenseAmount = Number(newWallet[UpdateType]! + Number(newTransactionAmount))

        await createOrUpdateWallet({
          id: newWalletId,
          amount: newWalletAmount,
          [UpdateType]: newIncomeExpenseAmount
        });
    
    return {success: true}
  } catch (err:any) {
    console.log('error updating wallet for new transaction: ', err);
    return {success: false, msg: err.message}
  }
}
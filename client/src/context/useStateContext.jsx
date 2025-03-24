import React, { useContext, createContext } from 'react';
import { 
  useAddress, 
  useContract, 
  useMetamask, 
  useContractWrite 
} from '@thirdweb-dev/react';
import { ethers, BigNumber } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const contractAddress = "0xf7B9Cd11558C65BB1627aB9d96179612EA12CA8D"; 
  const { contract, isLoading } = useContract(contractAddress);
  
  // Contract write functions
  const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");
  const { mutateAsync: deleteCampaign } = useContractWrite(contract, "deleteCampaign");
  const { mutateAsync: withdrawFunds } = useContractWrite(contract, "withdrawFunds");
  const { mutateAsync: refundDonations } = useContractWrite(contract, "refundDonations");

  const address = useAddress();
  const connect = useMetamask();

  /** Create a new campaign */
  const publishCampaign = async (form) => {
    try {
      if (!contract) {
        alert("Smart contract not found.");
        return;
      }

      if (!form.target || isNaN(form.target) || Number(form.target) <= 0) {
        alert("Invalid target amount. Please enter a valid number.");
        return;
      }

      if (!form.category) {
        alert("Please select a campaign category.");
        return;
      }

      const deadlineTimestamp = new Date(`${form.date}T${form.time}`).getTime();
      if (isNaN(deadlineTimestamp) || deadlineTimestamp <= Date.now()) {
        alert("Invalid deadline. Please select a future date.");
        return;
      }

      const targetWei = ethers.utils.parseEther(form.target.toString());
      const deadlineBigNumber = BigNumber.from(deadlineTimestamp.toString());

      const tx = await createCampaign({
        args: [
          address,
          form.title,
          form.description,
          targetWei,
          deadlineBigNumber, 
          form.image,
          form.category,
        ],
      });

      console.log("Campaign created successfully:", tx);
    } catch (error) {
      console.error("Contract call failure:", error);
      alert("Failed to create campaign. Please check your inputs and try again.");
    }
  };

  /** Fetch all campaigns */
  const getCampaigns = async () => {
    try {
      if (!contract || isLoading) {
        console.error("Contract is still loading. Cannot fetch campaigns.");
        return [];
      }

      const campaigns = await contract.call("getCampaigns");

      return campaigns
        .filter(campaign => campaign.owner !== "0x0000000000000000000000000000000000000000")
        .map((campaign, i) => ({
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: ethers.utils.formatEther(campaign.target.toString()),
          deadline: campaign.deadline.toNumber(),
          amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
          image: campaign.image,
          category: campaign.category,
          pId: i,
        }));
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
  };

  /** Fetch campaigns owned by the user */
  const getUserCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns();
      return allCampaigns.filter((campaign) => campaign.owner === address);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
      return [];
    }
  };

  /** Donate to a campaign */
  const donate = async (pId, amount) => {
    try {
      if (!contract || isLoading) {
        alert("Smart contract not found or still loading.");
        return;
      }

      const tx = await contract.call('donateToCampaign', [pId], { 
        value: ethers.utils.parseEther(amount),
        gasLimit: 300000,
      });

      console.log("Donation successful:", tx);
      return tx;
    } catch (error) {
      console.error("Error donating to campaign:", error);
      alert("Failed to donate. Please check your funds and try again.");
    }
  };

  /** Fetch donations for a campaign */
  const getDonations = async (pId) => {
    try {
      if (!contract || isLoading) {
        alert("Smart contract not found or still loading.");
        return [];
      }

      const donations = await contract.call('getDonators', [pId]);
      const numberOfDonations = donations[0].length;

      return Array.from({ length: numberOfDonations }).map((_, i) => ({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      }));
    } catch (error) {
      console.error("Error fetching donations:", error);
      return [];
    }
  };

  /** Withdraw campaign funds */
  const withdrawCampaignFunds = async (pId) => {
    try {
      if (!contract || isLoading) {
        alert("Smart contract not found or still loading.");
        return;
      }

      const tx = await withdrawFunds({ args: [pId] });
      console.log("Funds withdrawn successfully:", tx);
      return tx;
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      alert("Withdrawal failed.");
    }
  };

  /** Refund donations */
  const refundCampaignDonations = async (pId) => {
    try {
      if (!contract || isLoading) {
        alert("Smart contract not found or still loading.");
        return;
      }

      const tx = await refundDonations({ args: [pId] });
      console.log("Donations refunded successfully:", tx);
      return tx;
    } catch (error) {
      console.error("Error refunding donations:", error);
      alert("Refund failed.");
    }
  };

  /** Delete a campaign */
  const removeCampaign = async (pId) => {
    try {
      if (!contract || isLoading) {
        alert("Smart contract not found or still loading.");
        return;
      }

      const tx = await deleteCampaign({ args: [pId] });
      console.log("Campaign deleted successfully:", tx);
      return tx;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("Failed to delete campaign.");
    }
  };

  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        deleteCampaign: removeCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        withdrawCampaignFunds,
        refundCampaignDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

/** Custom Hook for Using Context */
export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateContextProvider");
  }
  return context;
};

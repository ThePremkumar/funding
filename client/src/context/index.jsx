import React, { useContext, createContext } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract('0xf7B9Cd11558C65BB1627aB9d96179612EA12CA8D');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const data = await createCampaign({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target,
          new Date(form.deadline).getTime(), // deadline
          form.image,
        ],
      });

      console.log("Contract call success", data);
    } catch (error) {
      console.error("Contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    if (!contract) return [];

    const campaigns = await contract.call('getCampaigns');

    return campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    return allCampaigns.filter((campaign) => campaign.owner === address);
  };

  const donate = async (pId, amount) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      const transaction = await contract.call('donateToCampaign', [pId], {
        value: ethers.utils.parseEther(amount),
      });

      return transaction;
    } catch (error) {
      console.error("Donation failed", error);
      throw error;
    }
  };

  const getDonations = async (pId) => {
    if (!contract) return [];

    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    return donations[0].map((donator, i) => ({
      donator,
      donation: ethers.utils.formatEther(donations[1][i].toString()),
    }));
  };

  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

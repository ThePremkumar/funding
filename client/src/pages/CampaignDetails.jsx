import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    if (!contract) return;

    const data = await getDonations(state.pId);
    setDonators(data);
  };

  useEffect(() => {
    if (contract) fetchDonators();
  }, [contract, address]);

  const handleDonate = async () => {
    if (!contract) {
      console.error("Contract is not initialized.");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      console.error("Invalid donation amount.");
      return;
    }

    setIsLoading(true);

    try {
      await donate(state.pId, amount);
      navigate('/');
    } catch (error) {
      console.error("Donation failed", error);
    }

    setIsLoading(false);
  };

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl"/>
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>
          <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>

          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>
          <div className="mt-[20px] flex flex-col gap-4">
            {donators.length > 0 ? donators.map((item, index) => (
              <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px]">{index + 1}. {item.donator}</p>
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px]">{item.donation}</p>
              </div>
            )) : (
              <p className="font-epilogue font-normal text-[16px] text-[#808191]">No donators yet. Be the first one!</p>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="text-center text-[#808191]">Fund the campaign</p>
            <br />
            <input 
              type="number"
              placeholder="ETH 0.1"
              className="w-full py-[10px] px-[15px] border bg-transparent text-white rounded-[10px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={remainingDays <= 0 || state.owner === address}
            />
            <br/>
            <CustomButton 
              btnType="button"
              title={remainingDays <= 0 ? "Campaign Expired" : "Fund Campaign"}
              styles={`w-full ${remainingDays <= 0 || state.owner === address ? "bg-gray-500 cursor-not-allowed" : "bg-[#8c6dfd]"}`}
              handleClick={handleDonate}
              disabled={remainingDays <= 0 || state.owner === address}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;

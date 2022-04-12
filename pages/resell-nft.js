import axios from "axios";
import { ethers } from "hardhat";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Modal from 'web3modal'

import { marketplaceAddress } from '../config'
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol'

export default function ResellNFT() {
    const [formInput, setFormInput] = useState({ price: '', image: '' })
    const router = useRouter()
    const { id, tokenURI } = router.query
    const { image, price } = formInput

    useEffect(() => {
        fetchNFT()
    }, [id])

    async function fetchNFT() {
        if (!tokenURI) return
        const meta = await axios.get(tokenURI)
        updateFormInput(state => ({ ...state, image: meta.data.image }))
    }

    async function listNFTForSale() {
        if (!price) return
        const web3Modal = Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
        let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
        let listingPrice = await contract.getListingPrice()

        listingPrice = listingPrice.toString()
        let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
        await transaction.wait()

        router.push('/')
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                {
                    image && (
                        <img src={image} width="350" className="rounded mt-4" />
                    )
                }
                <button className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-bg">List NFT</button>
            </div>
        </div>
    )
}
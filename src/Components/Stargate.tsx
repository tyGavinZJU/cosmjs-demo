import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
	Account,
	Block,
	Coin,
	SequenceResponse,
	StargateClient,
} from "@cosmjs/stargate";
import React, { useEffect, useState } from "react";
import chain from "../config/osmosis";
import { useInterval } from "../Hooks/useInterval";

function Stargate() {
	const [mnemonic, setMnemonic] = useState<string>(localStorage.getItem("mnemonic"));
	const [address, setAddress] = useState<string>();
	const [balance, setBalance] = useState<Coin>();
	const [allBalance, setAllBalances] = useState<Coin[]>();
	const [client, setClient] = useState<any>();
	const [height, setHeight] = useState<number>();
	const [chainId, setChainId] = useState<string>();
	const [account, setAccount] = useState<Account>();
	const [block, setBlock] = useState<Block>();
	const [sequence, setSequence] = useState<SequenceResponse>();

	const [timestamp, setTimestamp] = useState(0);
	useInterval(() => setTimestamp(new Date().getTime()), 1000);

	// 连接
	useEffect(() => {

		if (!chain) return;
		setMnemonic("economy bargain pond assist ring palace jeans hurry enter luggage segment pyramid")
		connect();
	}, [chain]);

	useEffect(() => {
		if (!mnemonic) return;
		getAddressByMnemonic();
	}, [mnemonic]);

	// 余额查询
	useEffect(() => {
		if (!address || !client) return;
		getBalance();
	}, [timestamp, address, client]);

	// 实现stargate基础api
	useEffect(() => {
		if (!address || !client) return;
		getOthers();
	}, [address, client]);

	// 创建账户 Todo
	const createAccount = async () => {
		let account
		if (mnemonic != undefined) {
			
			let r = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix : chain.bech32Config.bech32PrefixAccAddr})
			account = await r.getAccounts()
			console.log(account)
			console.log(String(account[0].address))
			setAddress(String(account[0].address))
			await getAddressByMnemonic()
		}

	};

	// 通过助记词钱包获得地址 Todo
	const getAddressByMnemonic = async () => {
		let r = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix : chain.bech32Config.bech32PrefixAccAddr})
		//console.log("in")
		let account = await r.getAccounts()
		//console.log(account)
		//console.log(String(account[0].address))
		setAddress(String(account[0].address))
		if (client) {
			console.log(client.getAccount, "in2", String(account[0].address))
			let rA = await client.getAccount(String(account[0].address))
			console.log(rA)
			setAccount(rA)
		}
	}

	// 余额查询 Todo
	const getBalance = async () => {
		if (client) {
			if (address) {
				let b = await client.getAllBalances(address)
				//console.log("balances:", b)
				setAllBalances(b)
			}
		}

		
	};

	// strageClient 基础 api 使用 Todo
	const getOthers = async () => {
		if (client) {
			let r = await StargateClient.connect(chain.rpc)
			//console.log(r)
			setClient(r)

			if (chainId == undefined) {
				let rChainId = await client.getChainId()
				setChainId(rChainId)
			}

			if (block == undefined && height != undefined) {
				let rBlockOne = await client.getBlock(height)
				setBlock(rBlockOne)
			}

			if (height == undefined) {
				let rHeight = await client.getHeight()

				
				//console.log(rHeight)
				setHeight(rHeight)
			}
			
		}
	};

	// connect client Todo
	const connect = async () => {
		let r = await StargateClient.connect(chain.rpc)
		//console.log(r)
		setClient(r)
	};

	// disconnect client Todo
	const disConnect = async () => {
		setClient(null)
	};

	return (
		<div className="stargate">
			<h2>StargateClient</h2>
			<label>
				<span>Chain: Osmosis </span>
				<button onClick={client?.queryClient ? disConnect : connect}>
					{client?.queryClient ? "断开" : "连接"}
				</button>
			</label>
			<div className="weight">
				<span>
					助记词: &nbsp;
					<input
						type="text"
						value={mnemonic}
						placeholder="economy bargain pond assist ring palace jeans hurry enter luggage segment pyramid"
						style={{ width: "400px" }}
						onChange={(e) => setMnemonic(e.target.value.trim())}
					/>
					<button onClick={createAccount}>创建账户</button>
				</span>
				&nbsp;&nbsp;
			</div>
			<div className="weight">
				<span style={{ whiteSpace: "nowrap" }}>余额: &nbsp;</span>
				{balance?.amount && (
					<>
						<span>
							{parseFloat(
								String(Number(balance?.amount) / Math.pow(10, 6))
							).toFixed(2)}
						</span>
						<span>{balance?.denom}</span>
					</>
				)}
			</div>
			<hr />
			<label>1、水龙头</label>
			<div>
				<span>
					Address: <b>{address}</b>
				</span>
				&nbsp;
				{address && (
					<a href="https://faucet.osmosis.zone/" target="_blank">
						获取
					</a>
				)}
			</div>
			<label>2、getChainId()</label>
			<div>
				<span>ChainId: {chainId} </span>
			</div>
			<label>3、getBalance()</label>
			<div>
				<span>Balance: </span>
				{balance?.amount && (
					<>
						<span>
							{parseFloat(
								String(Number(balance?.amount) / Math.pow(10, 6))
							).toFixed(2)}
						</span>
						<span> {balance?.denom}</span>
					</>
				)}
			</div>
			<label>4、getAccount()</label>
			<div>
				<div>address: {account?.address}</div>
				<div>accountNumber: {account?.accountNumber}</div>
				<div>sequence: {account?.sequence}</div>
			</div>

			<label>5、getHeight()</label>
			<div>Height: {height}</div>
			<label>6、getBlock()</label>
			<div>Blockhash:{block?.id}</div>
			<label>7、getAllBalances()</label>
			<div>
				{allBalance?.map((item) => {
					return (
						<div className="ell" key={item.denom}>
							{parseFloat(
								String(Number(item?.amount) / Math.pow(10, 6))
							).toFixed(2)}
							&nbsp;
							{item?.denom}
						</div>
					);
				})}
			</div>
			<label>8、getSequence()</label>
			<div>
				<div>accountNumber :{sequence?.accountNumber}</div>
				<div>sequence :{sequence?.sequence}</div>
			</div>
			{/* <label>9、getQueryClient()</label>
			<div>queryClient: {JSON.stringify(queryAccount?.toString())}</div> */}
		</div>
	);
}

export default Stargate;

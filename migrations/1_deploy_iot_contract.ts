type Network = "development" | "kovan" | "mainnet";

module.exports = (artifacts: Truffle.Artifacts, web3: Web3) => {
  return async (
    deployer: Truffle.Deployer,
    network: Network,
    accounts: string[]
  ) => {
    const IotMeasurementRegistry = artifacts.require('IotMeasurementRegistry');
    deployer.deploy(IotMeasurementRegistry);

    const iotMeasurementRegistry = await IotMeasurementRegistry.deployed();

    console.log(
      `Metacoin deployed at ${iotMeasurementRegistry.address} in network: ${network}.`
    );
  };
};
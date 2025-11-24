type Network = "development" | "kovan" | "mainnet";

module.exports = async (deployer: Truffle.Deployer, network: Network, accounts: string[]) => {
  const IotMeasurementRegistry = artifacts.require('IotMeasurementRegistry');

  // Czekamy, aż deploy się zakończy
  await deployer.deploy(IotMeasurementRegistry);

  const iotMeasurementRegistry = await IotMeasurementRegistry.deployed();

  console.log(
    `IotMeasurementRegistry deployed at ${iotMeasurementRegistry.address} on network: ${network}.`
  );
};

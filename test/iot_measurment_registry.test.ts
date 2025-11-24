import { assert } from "chai";
const IotMeasurementRegistry = artifacts.require("IotMeasurementRegistry");

contract("IotMeasurementRegistry", accounts => {
  const owner = accounts[0];
  const device1 = accounts[1];

  it("should deploy and register device", async () => {
    const instance = await IotMeasurementRegistry.deployed();
    
    // Owner rejestruje urządzenie
    await instance.registerDevice(device1, 2, { from: owner }); // 2 = User

    const device = await instance.devices(device1);
    assert.equal(device.exists, true);
    assert.equal(device.role.toNumber(), 2);
  });

  it("device can store measurement", async () => {
    const instance = await IotMeasurementRegistry.deployed();

    // Device wysyła pomiar
    await instance.storeMeasurement("temp:24C", { from: device1 });

    const measurements = await instance.getMeasurements(device1, { from: device1 });
    assert.equal(measurements.length, 1);
    assert.equal(measurements[0].data, "temp:24C");
  });
});

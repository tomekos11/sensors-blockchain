// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IotMeasurementRegistry {
    enum Role { Owner, Admin, User }

    struct Device {
        Role role;
        bool exists;
    }

    struct Measurement {
        uint256 timestamp;
        string data; // można zmienić typ na uint, bytes itd. w zależności od typu pomiaru
    }

    address public owner;
    mapping(address => Device) public devices;
    mapping(address => Measurement[]) private measurements;

    event DeviceRegistered(address device, Role role);
    event MeasurementStored(address device, uint256 timestamp, string data);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRegistered() {
        require(devices[msg.sender].exists, "Device not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        devices[owner] = Device(Role.Owner, true);
    }

    // Owner może dodać lub zmienić role urządzeń
    function registerDevice(address deviceAddress, Role role) external onlyOwner {
        devices[deviceAddress] = Device(role, true);
        emit DeviceRegistered(deviceAddress, role);
    }

    // Urządzenie rejestruje swój pomiar (może to być wywołane przez urządzenie w sieci)
    function storeMeasurement(string calldata data) external onlyRegistered {
        measurements[msg.sender].push(Measurement(block.timestamp, data));
        emit MeasurementStored(msg.sender, block.timestamp, data);
    }

    // Pobranie pomiarów dla konkretnego urządzenia (tylko dla właściciela kontraktu lub danego urządzenia)
    function getMeasurements(address deviceAddress) external view returns (Measurement[] memory) {
        require(msg.sender == owner || msg.sender == deviceAddress, "Access denied");
        return measurements[deviceAddress];
    }
}

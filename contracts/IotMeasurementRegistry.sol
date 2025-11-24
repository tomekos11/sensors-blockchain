// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IotMeasurementRegistry {
    enum Role { Owner, Admin, Sensor }

    struct Sensor {
        bool exists;
        string city;
        string country;
        uint256 range;
    }

    struct Measurement {
        uint256 timestamp;
        string data;
    }

    address public owner;

    mapping(address => bool) public admins;        // LISTA ADMINÓW
    mapping(address => Sensor) public sensors;     // LISTA SENSORÓW
    mapping(address => Measurement[]) private measurements;

    address[] private sensorList; // lista kluczy sensorów

    event AdminRegistered(address admin);
    event SensorRegistered(address sensor, string city, string country, uint256 range);
    event MeasurementStored(address sensor, uint256 timestamp, string data);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOwnerOrAdmin() {
        require(
            msg.sender == owner || admins[msg.sender] == true,
            "Only owner or admin"
        );
        _;
    }

    modifier onlySensor() {
        require(sensors[msg.sender].exists, "Only sensor");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ---------------------------
    //         ADMINY
    // ---------------------------

    function registerAdmin(address adminAddress) external onlyOwner {
        admins[adminAddress] = true;
        emit AdminRegistered(adminAddress);
    }

    // ---------------------------
    //        SENSORY
    // ---------------------------

    // Owner lub Admin może rejestrować sensory
    function registerSensor(
        address sensorAddress,
        string calldata city,
        string calldata country,
        uint256 range
    ) external onlyOwnerOrAdmin {
        sensors[sensorAddress] = Sensor(true, city, country, range);
        sensorList.push(sensorAddress);

        emit SensorRegistered(sensorAddress, city, country, range);
    }

    // ---------------------------
    //       POMIARY
    // ---------------------------

    // Tylko sensor może dodawać pomiary
    function storeMeasurement(string calldata data) external onlySensor {
        measurements[msg.sender].push(Measurement(block.timestamp, data));
        emit MeasurementStored(msg.sender, block.timestamp, data);
    }

    // Sensor dostaje tylko swoje, admin/owner mogą pobrać dowolne
    function getMeasurements(address sensorAddress)
        external
        view
        returns (Measurement[] memory)
    {
        require(
            msg.sender == sensorAddress ||
            admins[msg.sender] == true ||
            msg.sender == owner,
            "Access denied"
        );
        return measurements[sensorAddress];
    }

    // ---------------------------
    //    POBIERANIE DANYCH
    // ---------------------------

    function getAllSensors()
        external
        view
        onlyOwnerOrAdmin
        returns (Sensor[] memory, address[] memory)
    {
        Sensor[] memory list = new Sensor[](sensorList.length);

        for (uint256 i = 0; i < sensorList.length; i++) {
            list[i] = sensors[sensorList[i]];
        }

        return (list, sensorList);
    }

    function getAllMeasurements()
        external
        view
        onlyOwnerOrAdmin
        returns (address[] memory, Measurement[][] memory)
    {
        Measurement[][] memory out = new Measurement[][](sensorList.length);

        for (uint256 i = 0; i < sensorList.length; i++) {
            out[i] = measurements[sensorList[i]];
        }

        return (sensorList, out);
    }
}

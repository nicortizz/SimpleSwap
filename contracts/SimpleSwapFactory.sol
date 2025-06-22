// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SimpleSwap.sol";

/// @title SimpleSwapFactory
/// @notice Deploys and tracks SimpleSwap pools for unique token pairs
contract SimpleSwapFactory {
    /// @notice Mapping from tokenA => tokenB => pool address
    mapping(address => mapping(address => address)) public getPool;
    /// @notice Array of all deployed pools
    address[] public allPools;

    event PoolCreated(address indexed tokenA, address indexed tokenB, address pool);

    /**
     * @notice Create a new pool for a given token pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @return pool Address of deployed SimpleSwap pool
     */
    function createPool(address tokenA, address tokenB) external returns (address pool) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(getPool[tokenA][tokenB] == address(0), "Pool already exists");

        // Ensure consistent ordering
        (address token0, address token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);

        SimpleSwap newPool = new SimpleSwap(token0, token1);
        pool = address(newPool);

        getPool[token0][token1] = pool;
        getPool[token1][token0] = pool;

        allPools.push(pool);

        emit PoolCreated(token0, token1, pool);
    }

    /// @notice Returns number of deployed pools
    function allPoolsLength() external view returns (uint) {
        return allPools.length;
    }
}

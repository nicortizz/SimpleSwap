// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SimpleSwap
 * @dev A minimal decentralized exchange contract similar to Uniswap V2
 */
contract SimpleSwap is ERC20 {

    event LiquidityAdded(address indexed provider, uint amountA, uint amountB, uint liquidity);
    event LiquidityRemoved(address indexed provider, uint amountA, uint amountB, uint liquidity);
    event TokenSwapped(address indexed sender, address indexed inputToken, address indexed outputToken, uint amountIn, uint amountOut, address to);

    address public tokenA;
    address public tokenB;

    uint public reserveA;
    uint public reserveB;

    constructor(address _tokenA, address _tokenB)
        ERC20("SimpleSwap LP Token", "SS-LP")
    {
        require(_tokenA != _tokenB, "Identical tokens");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function getReserves() external view returns (uint _reserveA, uint _reserveB) {
        return (reserveA, reserveB);
    }

    /**
     * @notice Add liquidity to the pool
     * @param amountADesired Desired amount of tokenA
     * @param amountBDesired Desired amount of tokenB
     * @param amountAMin Minimum acceptable amount of tokenA
     * @param amountBMin Minimum acceptable amount of tokenB
     * @param to Recipient address of LP tokens
     * @param deadline Expiry timestamp
     */
    function _addLiquidity(
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) internal returns (uint amountA, uint amountB, uint liquidity) {
        require(block.timestamp <= deadline, "Deadline passed");

        if (totalSupply() == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "Insufficient B amount");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal >= amountAMin, "Insufficient A amount");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);

        if (totalSupply() == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * totalSupply()) / reserveA,
                (amountB * totalSupply()) / reserveB
            );
        }

        _mint(to, liquidity);

        reserveA += amountA;
        emit LiquidityAdded(to, amountA, amountB, liquidity);
        reserveB += amountB;
    }

    /**
     * @notice Remove liquidity from the pool
     * @param liquidity Amount of LP tokens to burn
     * @param amountAMin Minimum acceptable amount of tokenA
     * @param amountBMin Minimum acceptable amount of tokenB
     * @param to Recipient address
     * @param deadline Expiry timestamp
     */
    function _removeLiquidity(
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) internal returns (uint amountA, uint amountB) {
        require(block.timestamp <= deadline, "Deadline passed");

        uint total = totalSupply();

        amountA = (liquidity * reserveA) / total;
        amountB = (liquidity * reserveB) / total;

        require(amountA >= amountAMin, "Insufficient A amount");
        require(amountB >= amountBMin, "Insufficient B amount");

        _burn(msg.sender, liquidity);

        reserveA -= amountA;
        reserveB -= amountB;

        IERC20(tokenA).transfer(to, amountA);
        IERC20(tokenB).transfer(to, amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidity);
    }

    /// @notice Wrapper to match SwapVerifier interface
    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        returns (uint amountA, uint amountB, uint liquidity)
    {
        require(
            (_tokenA == tokenA && _tokenB == tokenB) ||
            (_tokenA == tokenB && _tokenB == tokenA),
            "Invalid token pair"
        );
        // reorder if necessary
        if (_tokenA == tokenA && _tokenB == tokenB) {
            return _addLiquidity(
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to,
                deadline
            );
        } else {
            // reverse amounts and minimums
            return _addLiquidity(
                amountBDesired,
                amountADesired,
                amountBMin,
                amountAMin,
                to,
                deadline
            );
        }
    }

    /// @notice Wrapper to match SwapVerifier interface
    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        returns (uint amountA, uint amountB)
    {
        require(
            (_tokenA == tokenA && _tokenB == tokenB) ||
            (_tokenA == tokenB && _tokenB == tokenA),
            "Invalid token pair"
        );
        return _removeLiquidity(
            liquidity,
            amountAMin,
            amountBMin,
            to,
            deadline
        );
    }

    /**
     * @notice Swap an exact amount of input token for output token
     * @param amountIn Amount of input token
     * @param amountOutMin Minimum acceptable amount of output token
     * @param path Array with input and output token addresses
     * @param to Recipient address
     * @param deadline Expiry timestamp
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(path.length == 2, "Invalid path");
        require(block.timestamp <= deadline, "Deadline passed");

        address input = path[0];
        address output = path[1];
        require((input == tokenA && output == tokenB) || (input == tokenB && output == tokenA), "Invalid token pair");

        bool isAToB = input == tokenA;
        uint reserveIn = isAToB ? reserveA : reserveB;
        uint reserveOut = isAToB ? reserveB : reserveA;

        IERC20(input).transferFrom(msg.sender, address(this), amountIn);

        uint amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
        require(amountOut >= amountOutMin, "Insufficient output amount");

        IERC20(output).transfer(to, amountOut);

        if (isAToB) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;

        emit TokenSwapped(msg.sender, input, output, amountIn, amountOut, to);
    }

    /// @notice Returns the price of tokenA in terms of tokenB
    function getPrice(address _tokenA, address _tokenB) external view returns (uint price) {
        require((_tokenA == tokenA && _tokenB == tokenB) || (_tokenA == tokenB && _tokenB == tokenA), "Invalid tokens");
        if (_tokenA == tokenA) {
            price = (reserveB * 1e18) / reserveA;
        } else {
            price = (reserveA * 1e18) / reserveB;
        }
    }

    /// @notice Calculate amount of output tokens given input
    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure returns (uint amountOut) {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "Invalid input");
    
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }

    /// @notice Internal helper to get square root (Babylonian method)
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    /// @notice Internal helper to get minimum of two numbers
    function min(uint x, uint y) internal pure returns (uint) {
        return x < y ? x : y;
    }
}

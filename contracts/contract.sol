// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Roulette {
    address public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event BetPlaced(
        address indexed user,
        string choice,
        uint256 amount,
        uint256 winningNumber,
        string resultColor,
        uint256 payout
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ====== Deposit / Withdraw ======
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Not enough in contract");

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }

    // ====== Bet ======
    function bet(string calldata choice, uint256 amount) external {
        // 0. Проверка: хватает ли у игрока денег на виртуальном балансе
        require(
            balances[msg.sender] >= amount,
            "Insufficient virtual balance. Use deposit()."
        );

        // Списываем ставку сразу (если проиграет — они остаются контракту)
        balances[msg.sender] -= amount;

        // 1. Генерация числа (0-36 для европейской, можно добавить 37 для американской)
        uint256 num = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)
            )
        );
        uint256 winningNumber = num % 37;

        // 2. Определяем цвет
        string memory resultColor = getNumberColor(winningNumber);

        // 3. Логика проверки выигрыша
        uint256 payout = 0;
        bool won = false;
        bytes32 choiceHash = keccak256(abi.encodePacked(choice));

        if (choiceHash == keccak256(abi.encodePacked("zero"))) {
            if (winningNumber == 0) {
                won = true;
                payout = amount * 36;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("even"))) {
            if (winningNumber != 0 && winningNumber % 2 == 0) {
                won = true;
                payout = amount * 2;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("odd"))) {
            if (winningNumber != 0 && winningNumber % 2 != 0) {
                won = true;
                payout = amount * 2;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("red"))) {
            if (
                keccak256(abi.encodePacked(resultColor)) ==
                keccak256(abi.encodePacked("red"))
            ) {
                won = true;
                payout = amount * 2;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("black"))) {
            if (
                keccak256(abi.encodePacked(resultColor)) ==
                keccak256(abi.encodePacked("black"))
            ) {
                won = true;
                payout = amount * 2;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("small"))) {
            if (winningNumber >= 1 && winningNumber <= 18) {
                won = true;
                payout = amount * 2;
            }
        } else if (choiceHash == keccak256(abi.encodePacked("big"))) {
            if (winningNumber >= 19 && winningNumber <= 36) {
                won = true;
                payout = amount * 2;
            }
        }

        // 4. Начисление выигрыша на внутренний баланс
        if (won) {
            balances[msg.sender] += payout;
        }

        emit BetPlaced(
            msg.sender,
            choice,
            amount,
            winningNumber,
            resultColor,
            payout
        );
    }

    // ====== Helpers ======
    function parseUint(string memory s) internal pure returns (int256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            if (uint8(b[i]) >= 48 && uint8(b[i]) <= 57) {
                result = result * 10 + (uint8(b[i]) - 48);
            }
        }
        return int256(result);
    }

    function getNumberColor(uint256 _num) public pure returns (string memory) {
        if (_num == 0) return "green";

        // Красные числа в рулетке
        if (
            _num == 1 ||
            _num == 3 ||
            _num == 5 ||
            _num == 7 ||
            _num == 9 ||
            _num == 12 ||
            _num == 14 ||
            _num == 16 ||
            _num == 18 ||
            _num == 19 ||
            _num == 21 ||
            _num == 23 ||
            _num == 25 ||
            _num == 27 ||
            _num == 30 ||
            _num == 32 ||
            _num == 34 ||
            _num == 36
        ) {
            return "red";
        }
        return "black";
    }

    function getBalance(address user) external view returns (uint256) {
        return balances[user];
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

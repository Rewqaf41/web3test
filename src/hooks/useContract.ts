import { BrowserProvider, Contract } from "ethers"
import { useCallback, useEffect, useState } from "react"

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADRESS || ""

const ROULETTE_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function bet(string calldata choice, uint256 amount) external",
  "function balances(address) view returns (uint256)",
  "function contractBalance() view returns (uint256)",
  "event BetPlaced(address indexed user, string choice, uint256 amount, uint256 winningNumber, string resultColor, uint256 payout)",
];

interface BetResult {
  winningNumber: number
  resultColor: string
  payout: bigint
}

export const useRoulette = () => {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Вспомогательная функция для получения контракта (signer)
  const getContract = useCallback(async () => {
    if (!window.ethereum) throw new Error("Метамаск не найден");

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, ROULETTE_ABI, signer);
  }, []);

  // Обновление баланса пользователя в контракте
  const refreshBalance = useCallback(async () => {
    try {
      if (!window.ethereum) return;
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ROULETTE_ABI, provider);

      const b = await contract.balances(await signer.getAddress());
      setBalance(b.toString());
    } catch (err) {
      console.error("Ошибка при получении баланса:", err);
    }
  }, []);

  // Пополнение баланса
  const deposit = async (ethAmount: string) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      console.log("Пытаемся задепозитить:", ethAmount, "wei");

      const val = BigInt(ethAmount);
      const tx = await contract.deposit({ value: val });

      console.log("Транзакция отправлена:", tx.hash);
      await tx.wait();
      await refreshBalance();
    } catch (err: any) {
      console.error("Детальная ошибка депозита:", err);
      setError(err.reason || err.message || "Ошибка транзакции");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Вывод средств
  const withdraw = async (ethAmount: string) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      console.log("Пытаемся вывести:", ethAmount, "wei");

      const tx = await contract.withdraw(BigInt(ethAmount));
      await tx.wait();
      await refreshBalance();
    } catch (err: any) {
      setError(err.reason || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Ставка - теперь возвращает результат
  const placeBet = async (
    choice: "red" | "black" | "zero" | "even" | "odd" | "small" | "big",
    ethAmount: string
  ): Promise<BetResult | null> => {
    setLoading(true);
    setError(null);
    try {
      console.log("Пытаемся поставить ставку:", choice, ethAmount, "wei");
      const contract = await getContract();
      
      const tx = await contract.bet(choice, BigInt(ethAmount));
      console.log("Транзакция отправлена:", tx.hash);

      // Ждем квитанцию, чтобы получить события
      const receipt = await tx.wait();

      // Поиск события BetPlaced для мгновенного результата
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === "BetPlaced");

      if (event) {
        const { winningNumber, resultColor, payout } = event.args;
        
        console.log("========== EVENT DATA ==========");
        console.log("Winning Number:", winningNumber.toString());
        console.log("Result Color:", resultColor);
        console.log("Payout:", payout.toString(), "wei");
        console.log("================================");

        await refreshBalance();

        return {
          winningNumber: Number(winningNumber),
          resultColor: resultColor,
          payout: payout,
        };
      }

      await refreshBalance();
      return null;
    } catch (err: any) {
      console.error("Ошибка ставки:", err);
      setError(err.reason || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Следим за изменением аккаунта и обновляем баланс при загрузке
  useEffect(() => {
    refreshBalance();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", refreshBalance);
    }
    return () => {
      window.ethereum?.removeListener("accountsChanged", refreshBalance);
    };
  }, [refreshBalance]);

  return {
    balance,
    deposit,
    withdraw,
    placeBet,
    loading,
    error,
    refreshBalance,
  };
};
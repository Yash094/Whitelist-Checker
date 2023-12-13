// Import necessary dependencies and icons (you may need to import lock and unlock icons)
import {
  useContract,
  useClaimConditions,
  ConnectWallet,
  useAddress,
  useActiveClaimCondition,
} from "@thirdweb-dev/react";
import {
  VStack,
  Box,
  Text,
  Heading,
  Flex,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { CONTRACT_ADDRESS } from "../const/address";
import { LockIcon, UnlockIcon } from "@chakra-ui/icons"; // Import lock and unlock icons from Chakra UI

// Add import statements for lock and unlock icons if not already imported

function Home() {
  const address = useAddress();
  const { data: contract } = useContract(CONTRACT_ADDRESS);

  const { data: claimConditions, isLoading } = useClaimConditions(
    contract,
    undefined,
    {
      withAllowList: true,
    }
  );
  const {
    data: activeCondition,
    isLoading: loadingActiveCondition,
    error,
  } = useActiveClaimCondition(contract);

  if (isLoading) {
    return <Loader />;
  }

  const generateClaimDetails = (userAddress, conditions) => {
    return conditions.reduce((acc, condition) => {
      const matchingSnapshot = condition.snapshot?.find(
        (snap) => snap && snap.address === userAddress
      );
      console.log(matchingSnapshot);
      if (condition.maxClaimablePerWallet >= 1) {
        acc.push({
          phase: condition,
          maxClaimable:
            matchingSnapshot?.maxClaimable || condition.maxClaimablePerWallet,
          price:
            matchingSnapshot?.price || condition.currencyMetadata.displayValue,
          isEligible: true,
        });
      } else if (matchingSnapshot) {
        acc.push({
          phase: condition,
          maxClaimable: matchingSnapshot.maxClaimable,
          isEligible: true,
          price: matchingSnapshot.price,
        });
      } else if (condition.snapshot === null) {
        // Handle case where condition.snapshot is null
        acc.push({
          phase: condition,
          maxClaimable: condition.maxClaimablePerWallet,
          isEligible: true,
        });
      } else {
        acc.push({
          phase: condition,
          maxClaimable: condition.maxClaimablePerWallet,
          isEligible: false,
        });
      }

      return acc;
    }, []);
  };

  const claimDetails = generateClaimDetails(address, claimConditions);

  return (
    <>
      <Flex direction="column" align="center" justify="center" height="150vh">
        {address ? (
          <>
            <VStack align="center" spacing={4}>
              <Heading color="white">Available Phases</Heading>
              <Text color="white">
                Wallet: {address}
                <br />
                (You can claim in the phases with the unlock icon next to them)
              </Text>
              {claimDetails.length > 0 ? (
                <VStack align="center" spacing={4}>
                  {claimDetails.map((condition, index) => (
                    <Flex
                      key={index}
                      align="center"
                      justify="space-between"
                      borderWidth="1px"
                      borderRadius="lg"
                      p={4}
                      color="white"
                      maxW="500px"
                      width="100%"
                      borderColor={
                        condition.phase.startTime.toString() ==
                        activeCondition.startTime.toString()
                          ? "blue.500"
                          : "white"
                      }
                    >
                      <VStack align="flex-start" spacing={2} flex="1">
                        <Text fontSize="lg">
                          {index + 1}. {condition.phase.metadata.name}
                        </Text>
                        <Text>
                          Limit:{" "}
                          {condition.maxClaimable.toString().toUpperCase()}
                        </Text>
                        <Text>
                          Price:{" "}
                          {condition.price
                            ? condition.price
                            : condition.phase.currencyMetadata
                                .displayValue}{" "}
                          {condition.phase.currencyMetadata.symbol}
                        </Text>
                        <Text>
                          Start Time: {condition.phase.startTime.toString()}
                        </Text>
                      </VStack>
                      {condition.isEligible ? (
                        // Display unlock icon if eligible
                        <IconButton aria-label="Unlock" icon={<UnlockIcon />} />
                      ) : (
                        // Display lock icon if not eligible
                        <IconButton aria-label="Lock" icon={<LockIcon />} />
                      )}
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Text color="white">No phases available for claiming.</Text>
              )}
            </VStack>
          </>
        ) : (
          <ConnectWallet />
        )}
      </Flex>
    </>
  );
}

const Loader = () => {
  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <Spinner color="white" mt={4} />
    </Flex>
  );
};

export default Home;

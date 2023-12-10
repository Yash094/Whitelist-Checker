import {
  useContract,
  useClaimConditions,
  ConnectWallet,
  useAddress,
} from "@thirdweb-dev/react";
import { VStack, Box, Text, Heading, Flex, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS } from "../const/address";

function Home() {
  const [claimDetails, setClaimDetails] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const address = useAddress();
  const { data: contract } = useContract(CONTRACT_ADDRESS);

  const { data: claimConditions, isLoading } = useClaimConditions(
    contract,
    undefined,
    {
      withAllowList: true,
    }
  );

  useEffect(() => {
    if (!isLoading && claimConditions) {
      if (!address) {
        setIsLoadingData(false);
        return;
      }

      const newClaimDetails = generateClaimDetails(address, claimConditions);
      setClaimDetails(newClaimDetails);
      setIsLoadingData(false);
    }
  }, [isLoading, claimConditions, address]);

  const generateClaimDetails = (userAddress, conditions) => {
    return conditions.reduce((acc, condition) => {
      const matchingSnapshot = condition.snapshot?.find(
        (snap) => snap && snap.address === userAddress
      );

      if (condition.maxClaimablePerWallet >= 1) {
        acc.push({
          phase: condition,
          maxClaimable:
            matchingSnapshot?.maxClaimable || condition.maxClaimablePerWallet,
        });
      } else if (matchingSnapshot) {
        acc.push({
          phase: condition,
          maxClaimable: matchingSnapshot.maxClaimable,
        });
      } else if (condition.snapshot === null) {
        // Handle case where condition.snapshot is null
        acc.push({
          phase: condition,
          maxClaimable: condition.maxClaimablePerWallet,
        });
      }

      return acc;
    }, []);
  };
  return (
    <>
      <Flex direction="column" align="center" justify="center" height="100vh">
        {address ? (
          <>
            <VStack align="center" spacing={4}>
              <Heading color="white">
                Your Wallet Can Claim in the Following Phases
              </Heading>
              <Text color="white">Wallet: {address}</Text>
              {isLoadingData ? (
                <Spinner color="white" mt={4} />
              ) : claimDetails.length > 0 ? (
                <VStack align="center" spacing={4}>
                  {claimDetails.map((condition, index) => (
                    <Box
                      key={index}
                      borderWidth="1px"
                      borderRadius="lg"
                      p={4}
                      color="white"
                      maxW="500px"
                      width="100%"
                    >
                      <Text fontSize="lg">
                        {index + 1}. {condition.phase.metadata.name}
                      </Text>
                      <Text>Limit: {condition.maxClaimable}</Text>
                      <Text>
                        Price: {condition.phase.currencyMetadata.displayValue}{" "}
                        {condition.phase.currencyMetadata.symbol}
                      </Text>
                      <Text>
                        Start Time: {condition.phase.startTime.toString()}
                      </Text>
                    </Box>
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

export default Home;

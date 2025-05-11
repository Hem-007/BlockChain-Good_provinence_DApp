# Change to the project directory
cd E:\BlockChainProject\BlockChain-Good_provinence_DApp

# Start the Next.js development server and capture output
$output = npm run dev 2>&1

# Write the output to a file
$output | Out-File -FilePath .\server-output.log

# Display the output
$output

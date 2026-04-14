Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
    [Parameter(Mandatory = $true)]
    [string]$AwsAccountId,

    [Parameter(Mandatory = $false)]
    [string]$Region = "ap-south-1",

    [Parameter(Mandatory = $false)]
    [string]$Repository = "mfp-backend",

    [Parameter(Mandatory = $false)]
    [string]$Tag = "latest",

    [Parameter(Mandatory = $false)]
    [string]$ContextPath = ".\\mfp_backend"
)

$registry = "$AwsAccountId.dkr.ecr.$Region.amazonaws.com"
$repoUri = "$registry/$Repository"
$localImage = "$Repository`:$Tag"
$remoteImage = "$repoUri`:$Tag"

Write-Host "Checking ECR repository: $Repository"
$repoExists = $true
try {
    aws ecr describe-repositories --repository-names $Repository --region $Region --output none | Out-Null
}
catch {
    $repoExists = $false
}

if (-not $repoExists) {
    Write-Host "Repository does not exist. Creating: $Repository"
    aws ecr create-repository --repository-name $Repository --region $Region --output none | Out-Null
}

Write-Host "Logging in to ECR: $registry"
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry

Write-Host "Building image: $localImage"
docker build -t $localImage $ContextPath

Write-Host "Tagging image: $remoteImage"
docker tag $localImage $remoteImage

Write-Host "Pushing image to ECR"
docker push $remoteImage

Write-Host ""
Write-Host "Done."
Write-Host "Set this in your .env on server/local:"
Write-Host "ECR_BACKEND_IMAGE=$remoteImage"

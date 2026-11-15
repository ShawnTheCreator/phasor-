# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY Phasor.Domain/Phasor.Domain.csproj Phasor.Domain/
COPY Phasor.Engine/Phasor.Engine.csproj Phasor.Engine/
COPY Phasor.Notifications/Phasor.Notifications.csproj Phasor.Notifications/
COPY Phasor.Ingest/Phasor.Ingest.csproj Phasor.Ingest/
COPY Phasor.Api/Phasor.Api.csproj Phasor.Api/
RUN dotnet restore Phasor.Api/Phasor.Api.csproj

# Copy all source files and publish
COPY . .
WORKDIR /src/Phasor.Api
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "Phasor.Api.dll"]

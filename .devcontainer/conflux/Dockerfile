# Define build arguments for Node.js and Conflux release versions
ARG NODE_RELEASE=2.4.0
ARG BASE_IMAGE=node:20-slim

# Stage 1: Use the official Conflux Rust image as the base for building release artifacts
FROM confluxchain/conflux-rust:${NODE_RELEASE} AS release

# Stage 2: Use the official Node.js slim image as the base for the development kit
FROM ${BASE_IMAGE} AS devkit

# Define build arguments for Conflux node configuration
ARG CONFLUX_NODE_ROOT="/opt/conflux"
ARG CONFIG_PATH="${CONFLUX_NODE_ROOT}/develop.toml"
ARG SECRETS_PATH="${CONFLUX_NODE_ROOT}/genesis_secrets.txt"

# Install necessary dependencies and clean up apt lists to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \ 
        git \
        sudo \
        gettext-base \
        ca-certificates \ 
    && rm -rf /var/lib/apt/lists/*

# Copy Conflux binaries from the release stage to the current stage
COPY --from=release /bin/conflux /bin/conflux
COPY --from=release /bin/cfxkey /bin/cfxkey
COPY --from=release /bin/pos-genesis-tool /bin/pos-genesis-tool
COPY --from=release /bin/cfx-gen-dot /bin/cfx-gen-dot
COPY --from=release /bin/cfxstore /bin/cfxstore

# Create necessary directories for Conflux node operation
RUN mkdir -p ${CONFLUX_NODE_ROOT}

# Set environment variables for chain IDs and configuration paths
ENV CHAIN_ID=2029
ENV EVM_CHAIN_ID=2030
ENV CONFLUX_NODE_ROOT=${CONFLUX_NODE_ROOT}
ENV CONFIG_PATH=${CONFIG_PATH}
ENV SECRETS_PATH=${SECRETS_PATH}
ENV DEVKIT_PATH="/opt/devkit"


# Define build arguments for user creation
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Add utility scripts and templates to the image
COPY devkit ${DEVKIT_PATH}

# Create a new user if $USERNAME doesn't exist
RUN id -u $USERNAME >/dev/null 2>&1 || (groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USERNAME -m -s /bin/bash $USERNAME)

# Configure passwordless sudo for the created user
RUN echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Change ownership of the Conflux node directory to the created user
RUN chown -R ${USERNAME}:${USERNAME} ${CONFLUX_NODE_ROOT} \
    && chown -R ${USERNAME}:${USERNAME} ${DEVKIT_PATH}

# Switch to the created user context
USER $USERNAME  

# Set the working directory for the user
WORKDIR /workspaces/

# Configure npm and install devkit globally
RUN mkdir -p ~/.local/bin \
    && npm config set prefix '~/.local/' \ 
    && npm install -g npm@latest \ 
    && (cd ${DEVKIT_PATH} && npm run local_install) \
    && npm install --global hardhat-shorthand   

# Expose necessary ports for the Conflux node
EXPOSE 3000 12535 12537 8545 8546

# Set additional environment variables for the user
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    EDITOR=code \
    VISUAL=code \
    GIT_EDITOR="code --wait" \
    PATH=$PATH:/home/${USERNAME}/.local/bin:

# Set the default command to execute the development node script
ENTRYPOINT ["/bin/bash","-c","devkit --start --logs"]

# Stage 3: Use the devkit image as the base for setting up OpenVSCode server
FROM devkit AS openvscode

# Define build arguments for OpenVSCode server version and download URL
ARG SERVER_VERSION="1.90.0"
ARG SERVER_VERSION_NAME="openvscode-server-v${SERVER_VERSION}-linux-x64"
ARG SERVER_VERSION_URL="https://github.com/gitpod-io/openvscode-server/releases/download/openvscode-server-v${SERVER_VERSION}/${SERVER_VERSION_NAME}.tar.gz"
ARG OPENVSCODE_SERVER_ROOT="/opt/openvscode-server"

# Switch to root user for installing additional dependencies
USER root

# Install wget and libatomic1 for OpenVSCode server
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# Download and extract OpenVSCode server, then clean up
RUN wget ${SERVER_VERSION_URL} -O /tmp/code-server.tar.gz && \
    tar -xzf /tmp/code-server.tar.gz -C /opt && \
    rm /tmp/code-server.tar.gz && \
    mv /opt/${SERVER_VERSION_NAME} ${OPENVSCODE_SERVER_ROOT}

# Change ownership of the OpenVSCode server directory to the created user
RUN chown -R $USERNAME:$USERNAME ${OPENVSCODE_SERVER_ROOT}

# Switch back to the created user context
USER $USERNAME

# Set the OpenVSCode server root environment variable
ENV OPENVSCODE_SERVER_ROOT=${OPENVSCODE_SERVER_ROOT}

# Expose the port for OpenVSCode server
EXPOSE 5000

# Set the entry point for the OpenVSCode server
ENTRYPOINT ["/bin/sh", "-c", "exec ${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server --port 5000 --host 0.0.0.0 --without-connection-token \"${@}\"", "--"]

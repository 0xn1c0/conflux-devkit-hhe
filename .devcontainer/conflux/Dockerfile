ARG NODE_RELEASE=2.4.0
ARG BASE_IMAGE=node:20-slim
# Use the official Conflux Rust image as the base for release artifacts
FROM confluxchain/conflux-rust:${NODE_RELEASE} AS release

# Use the official Node.js slim image as the base for the devkit
FROM ${BASE_IMAGE} AS devkit

# Set up build arguments for Conflux node configuration
ARG CONFLUX_NODE_ROOT="/opt/conflux"
ARG CONFIG_PATH="${CONFLUX_NODE_ROOT}/develop.toml"

# Install necessary dependencies and remove apt lists to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \ 
        git \
        sudo \
        gettext-base \
        ca-certificates \ 
    && rm -rf /var/lib/apt/lists/*

# Copy Conflux binaries from the release stage
COPY --from=release /bin/conflux /bin/conflux
COPY --from=release /bin/cfxkey /bin/cfxkey
COPY --from=release /bin/pos-genesis-tool /bin/pos-genesis-tool
COPY --from=release /bin/cfx-gen-dot /bin/cfx-gen-dot
COPY --from=release /bin/cfxstore /bin/cfxstore

# Create necessary directories for Conflux node
RUN mkdir -p ${CONFLUX_NODE_ROOT} ${CONFLUX_NODE_ROOT}/log ${CONFLUX_NODE_ROOT}/pos_config

# Copy utility scripts and templates into the image
ADD utils ${CONFLUX_NODE_ROOT}/utils
ADD templates /tmp/

# Set environment variables
ENV CHAIN_ID=2029
ENV EVM_CHAIN_ID=2030
ENV CONFLUX_NODE_ROOT=${CONFLUX_NODE_ROOT}
ENV CONFIG_PATH=${CONFIG_PATH}

# Generate configuration files using environment variables and templates
RUN cat /tmp/log.yaml.template | envsubst > ${CONFLUX_NODE_ROOT}/log.yaml && \
    cat /tmp/develop.toml.template | envsubst > ${CONFIG_PATH} && \
    (cd ${CONFLUX_NODE_ROOT}/pos_config && pos-genesis-tool random --initial-seed=0000000000000000000000000000000000000000000000000000000000000000 --num-validator=1 --num-genesis-validator=1 --chain-id=${CHAIN_ID}) && \
    export WAYPOINT=$(cat ${CONFLUX_NODE_ROOT}/pos_config/waypoint_config) && cat /tmp/pos_config.yaml.template | envsubst > ${CONFLUX_NODE_ROOT}/pos_config/pos_config.yaml && \
    cat /tmp/sh/dev_node.sh.template | envsubst > /usr/bin/dev_node && chmod +x /usr/bin/dev_node && \
    cat /tmp/sh/genesis_espace.sh.template | envsubst > /usr/bin/genesis_espace && chmod +x /usr/bin/genesis_espace && \
    cat /tmp/sh/genesis_list.sh.template | envsubst > /usr/bin/genesis_list && chmod +x /usr/bin/genesis_list && \
    cat /tmp/sh/faucet.sh.template | envsubst > /usr/bin/faucet && chmod +x /usr/bin/faucet

RUN npm install -g npm@latest

# Set up user creation arguments
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create new user if $USERNAME doesn't exist
RUN id -u $USERNAME >/dev/null 2>&1 || (groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USERNAME -m -s /bin/bash $USERNAME)

# Configure passwordless sudo for the created user
RUN echo "$USERNAME ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Change ownership of Conflux node directory to the created user
RUN chown -R ${USER_UID}:${USER_GID} ${CONFLUX_NODE_ROOT}

# Switch to the created user
USER $USERNAME

# Install Node.js dependencies and generate genesis secrets
RUN (cd ${CONFLUX_NODE_ROOT}/utils && npm install && node genesis_secrets.js)

# Set the working directory
WORKDIR /workspaces/

# Expose necessary ports
EXPOSE 3000 12535 12537 8545 8546

# Set environment variables for the user
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    HOME=/workspaces \
    EDITOR=code \
    VISUAL=code \
    GIT_EDITOR="code --wait"

# Execute the development node as default command
CMD ["dev_node"]

# Use the devkit image as the base for OpenVSCode server setup
FROM devkit AS openvscode

# Set up build arguments for OpenVSCode server
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

# Download and extract OpenVSCode server
RUN wget ${SERVER_VERSION_URL} -O /tmp/code-server.tar.gz && \
    tar -xzf /tmp/code-server.tar.gz -C /opt && \
    rm /tmp/code-server.tar.gz && \
    mv /opt/${SERVER_VERSION_NAME} ${OPENVSCODE_SERVER_ROOT}

# Change ownership of OpenVSCode server directory to the created user
RUN chown -R $USERNAME:$USERNAME ${OPENVSCODE_SERVER_ROOT}

# Switch back to the created user
USER $USERNAME

ENV OPENVSCODE_SERVER_ROOT=${OPENVSCODE_SERVER_ROOT}

# Expose the port for OpenVSCode server
EXPOSE 5000

# Set the entry point for the OpenVSCode server
ENTRYPOINT ["/bin/sh", "-c", "exec ${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server --port 5000 --host 0.0.0.0 --without-connection-token \"${@}\"", "--"]

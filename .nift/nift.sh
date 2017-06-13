#!/usr/bin/env bash
set -e

if false; then
    source "../nift" --source-only
fi

nift() {
    echo "${NIFT_MOTD}"
    if [ NIFT_SLEEP ]; then
        sleep ${NIFT_SLEEP}
    fi

    SUB=$1
    case ${SUB} in
        "" | "-h" | "--help")
            sub_help
            ;;
        *)
            shift

            set +e
            sub_${SUB} $@

            if [ $? = 127 ]; then
                echo "Error: '${SUB}' is not a known subcommand." >&2
                echo "       Run '${SCRIPT_NAME} --help' for a list of known subcommands." >&2
                exit 1
            fi
            set -e
            ;;
    esac
}
SCRIPT_NAME=$(basename $0)

sub_help() { #                    - Show this text
    echo "Usage: ${SCRIPT_NAME} <subcommand> [options]"
    echo "Subcommands:"
    cat ${NIFT}/nift.sh | grep '^sub_.*#.*' | sed -E 's/sub_([a-z-]*).*#(.*)/    \1\2/'
}

sub_up() { #                      - Bring all services up
    docker-compose -f ${NIFT}/plugins.yml up -d
    sub_compose up -d ${SERVICES}
}

sub_down() { #                    - Stop and remove services
    sub_compose down
}

sub_ps() { #                      - Print service information
    sub_compose ps
}

sub_reload() { # <service>, ...   - Trigger a code/conf reload
    echo Reloading $@
    sub_compose kill -s SIGHUP $@
}

sub_start() { # <service>, ..     - Start service(s)
    sub_compose up -d $@
}

sub_stop() { # <service>, ...     - Stop service(s)
    sub_compose kill $@
}

sub_restart() { # <service>, ...  - Trigger entrypoint.sh, required after modifying anything in bitpool
    sub_stop $@
    sub_start $@
}

sub_attach() { # <service>        - Run bash on a running service
    sub_compose exec $@ bash
}

sub_compose() { # <cmd...>        - Run a compose with associated files
    docker-compose ${COMPOSE_FILES} $@
}

sub_logs() { # <service>, ...     - Show last 50 lines and attach to a service
    sub_compose logs --tail=50 -f $@
}


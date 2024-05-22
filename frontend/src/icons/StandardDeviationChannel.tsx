const StandardDeviationChannel = (props: {selected: boolean, color: string}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
            <g fill="currentColor" fillRule="nonzero">
                <path d="M7.551 17.98l13.284-7.033-.468-.884-13.284 7.033z"></path>
                <path d="M6 11.801l16-8.471v4.17h1v-5.83l-18 9.529v5.301h1z"></path>
                <path d="M6 24.67v-4.17h-1v5.83l18-9.529v-5.301h-1v4.699z"></path>
                <path
                    d="M5.5 20c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM22.5 11c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
            </g>
        </svg>

    )
}

export default StandardDeviationChannel;
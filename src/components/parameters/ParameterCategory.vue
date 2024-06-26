<template>
    <tr>
        <td colspan="3">
            <p class="parameter-category">
                <slot></slot>
            </p>
        </td>
    </tr>
</template>

<style scoped lang="scss">
.parameter-category {
    font-size: 1rem;
    font-weight: 500;
    padding: 0.5rem 0;
    //border-top: 1px dotted var(--lg-accent);
    text-align: start;
}
</style>
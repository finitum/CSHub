<template>
    <v-container fluid>
        <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
                <img src="@/assets/logo.png" alt="Vuetify.js" class="mb-5">
                <blockquote>
                    &#8220;First, solve the problem. Then, write the code.&#8221;
                    <footer>
                        <small>
                            <em>&mdash;John Johnson</em>
                        </small>
                    </footer>
                </blockquote>
            </v-layout>
        </v-slide-y-transition>
    </v-container>
</template>

<script lang="ts">
    import {LoginRequest} from '../../../faq-site-shared/socket-calls/auth/LoginRequest';
    import {ApiWrapper} from '../plugins/api/api-wrapper';

    export default {
        name: 'HelloWorld',
        props: {
            msg: String
        },
        mounted: () => {
            console.log('Executing request');

            ApiWrapper.sendRequest(new LoginRequest('hoi', 'hoi'));

        }
    };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>

package fit.messagequeuerabbitmq.config;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Configuration
public class JwtConfig {

    @Bean
    JwtEncoder jwtEncoder() throws Exception {
        String key = new String(
                getClass().getClassLoader()
                        .getResourceAsStream("keys/private.key")
                        .readAllBytes()
        );

        key = key.replaceAll("-----\\w+ PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        RSAPrivateKey privateKey = (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(
                        Base64.getDecoder().decode(key)
                ));

        JWK jwk = new RSAKey.Builder((RSAPublicKey) null)
                .privateKey(privateKey)
                .build();

        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
    }
}

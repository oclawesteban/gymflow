# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - heading "GymFlow" [level=1] [ref=e12]
      - paragraph [ref=e13]: Gestión de Gimnasio
    - generic [ref=e14]:
      - generic [ref=e15]:
        - heading "Iniciar Sesión" [level=2] [ref=e16]
        - paragraph [ref=e17]: Ingresa a tu cuenta
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Correo electrónico
          - generic [ref=e22]:
            - img [ref=e23]
            - textbox "Correo electrónico" [ref=e26]:
              - /placeholder: tu@correo.com
              - text: invalido@correo.com
        - generic [ref=e27]:
          - generic [ref=e28]: Contraseña
          - generic [ref=e29]:
            - img [ref=e30]
            - textbox "Contraseña" [ref=e33]:
              - /placeholder: ••••••••
              - text: contraseña_incorrecta
        - button "Entrar" [ref=e34]
      - paragraph [ref=e36]:
        - text: ¿No tienes cuenta?
        - link "Regístrate gratis" [ref=e37] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e38]
```